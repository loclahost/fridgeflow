import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { EventEmitter } from 'events';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { generateToken, verifyToken } from './middleware/auth.js';
import { useMongoDb } from './db/mongodb-adapter.js';
import { ObjectId } from 'mongodb';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SALT_ROUNDS = 5;

const app = express();
app.use(express.json());

const mongoDb = useMongoDb(process.env.DB_CONNECTION);

const VALID_ACTIONS = ['CREATE', 'UPDATE', 'DELETE'];
const VALID_PROPERTIES = ['label', 'itemType'];

const LIST_USERS = new Map();

const listEvents = new EventEmitter();

app.use('/api', verifyToken);

app.use((req, res, next) => {
	console.log(
		`Inkommande anrop: ${req.method} ${req.url}\n\n body: ${JSON.stringify(req.body || '"Empty body"')}`,
	);
	next();
});

app.get('/events/:userId', (req, res) => {
	const { userId } = req.params;

	//TODO Behörighet

	res.setHeader('Content-Type', 'text/event-stream');
	res.setHeader('Cache-Control', 'no-cache');
	res.setHeader('Connection', 'keep-alive');

	const updateHandler = (data) => {
		if (data.users.includes(userId)) {
			res.write(`data: ${JSON.stringify(data.payload)}\n\n`);
		}
	};

	listEvents.on('update', updateHandler);

	req.on('close', () => {
		listEvents.off('update', updateHandler);
		res.end();
	});
});

app.post('/register', async (req, res) => {
	const { email, password } = req.body;

	if (!email || !password) {
		return res.status(400).json({ error: 'Email and password are required' });
	}

	const existing = await mongoDb.findUser({ email });
	if (existing) {
		console.log(existing);
		return res.status(409).json({ error: 'Email already registered' });
	}

	const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
	await mongoDb.registerUser({ email, password: hashedPassword });

	res.status(201).json({ message: 'User registered successfully' });
});

app.post('/login', async (req, res) => {
	const { email, password } = req.body;

	const user = await mongoDb.findUser({ email });
	if (!user) {
		return res.status(401).json({ error: 'Invalid credentials' });
	}

	const valid = await bcrypt.compare(password, user.password);
	if (!valid) {
		return res.status(401).json({ error: 'Invalid credentials' });
	}

	const token = generateToken(user);

	res.json({ token, validTo: Date.now() + 45 * 60 * 1000 });
});

app.get('/api/lists', async (req, res) => {
	const lists = await mongoDb.getLists(req.user);
	for (const list of lists) {
		LIST_USERS.set(list._id.toString(), [list.user, ...list.shared]);
	}
	res.json(lists).end();
});

app.post('/api/list/create', async (req, res) => {
	const { label } = req.body;
	const listId = await mongoDb.createList(req.user, label);
	res.json({ listId }).end();
});

app.post('/api/list/delete', async (req, res) => {
	const { listId } = req.body;
	await mongoDb.deleteList(req.user, listId);
	res.status(200).end();
});

app.get('/api/list/:id', async (req, res) => {
	const list = (await mongoDb.getLists(req.user, req.params.id))[0];
	LIST_USERS.set(list._id.toString(), [list.user, ...list.shared]);
	res.json(list).end();
});

app.post('/api/list/:listId/item', async (req, res) => {
	const { action, property, item } = req.body;
	if (!action || !VALID_ACTIONS.includes(action)) {
		console.log('Invalid action', action);
		res.sendStatus(404);
		return;
	}

	await mongoDb.mutateItem(req.user, req.params.listId, item, action);

	listEvents.emit('update', {
		users: LIST_USERS.get(req.params.listId),
		payload: { listId: req.params.listId, eventOrigin: req.user },
	});

	res.status(200).end();
});

app.use(express.static(path.join(__dirname, 'public')));

app.get(/.*/, (req, res) => {
	console.log('Catch all');
	res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

try {
	await mongoDb.connect();
	await mongoDb.heartbeat();

	const PORT = process.env.PORT || 8080;
	app.listen(PORT, () => {
		console.log(`Server startad på port ${PORT}`);
	});
} catch (err) {
	console.log(err);
	await mongoDb.disconnect();
}
