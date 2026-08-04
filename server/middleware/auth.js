import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'change-this-secret';

export const verifyToken = (req, res, next) => {
	console.log('Auth: ', req.headers.authorization);
	const idToken = req.headers.authorization?.split('Bearer ')[1];

	if (!idToken) {
		return res.status(401).send('Unauthorized: No token provided');
	}

	jwt.verify(idToken, SECRET, (err, user) => {
		if (err) {
			return res.status(401).json({ error: 'Invalid or expired token' });
		}
		req.user = user;
		next();
	});
};

export const generateToken = (user) => {
	return jwt.sign({ _id: user._id, email: user.email }, SECRET, { expiresIn: '1h' });
};
