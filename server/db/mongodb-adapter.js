import { MongoClient, ServerApiVersion, ObjectId } from 'mongodb';
import { v4 as uuidV4 } from 'uuid';

const DATABASE = 'data';
const USER_COLLECTION = 'users';
const LIST_COLLECTION = 'lists';

export const useMongoDb = (connectionUri) => {
	const client = new MongoClient(connectionUri, {
		serverApi: {
			version: ServerApiVersion.v1,
			strict: true,
			deprecationErrors: true,
		},
	});

	const userCollection = () => client.db(DATABASE).collection(USER_COLLECTION);
	const listCollection = () => client.db(DATABASE).collection(LIST_COLLECTION);

	const connect = async () => {
		await client.connect();
	};

	const disconnect = async () => {
		await client.close();
	};

	const heartbeat = async () => {
		const result = await client.db(DATABASE).command({ ping: 1 });
		console.debug('Heartbeat ok');
		return result;
	};

	const registerUser = async (user) => {
		return await userCollection().insertOne({ ...user, createdAt: new Date() });
	};

	const findUser = async (user) => {
		return await userCollection().findOne({ oidcId: user.oidcId });
	};

	const updateExisitingUser = async (user, googleUser) => {
		return await userCollection().findOneAndUpdate(
			{ oidcId: user.oidcId },
			{ $set: { name: googleUser.name, email: googleUser.email } },
			{ returnDocument: 'after' },
		);
	};

	const getAccessFilter = (listId, user) => {
		let accessFilter = {};
		if (listId) {
			accessFilter._id = new ObjectId(listId);
		}
		if (user && user._id) {
			accessFilter.$or = [
				{ user: new ObjectId(user._id) },
				{ shared: { $elemMatch: { user: new ObjectId(user._id), allowWrite: true } } },
			];
		}
		console.log(
			'Access filter for user and list id',
			user,
			listId,
			JSON.stringify(accessFilter, undefined, 2),
		);
		return accessFilter;
	};

	const getLists = async (user, listId) => {
		const query = getAccessFilter(listId, user);
		return await listCollection().find(query).sort({ listSort: 1 }).toArray();
	};

	const createList = async (user, listLabel) => {
		const newList = {
			label: listLabel,
			user: new ObjectId(user._id),
			items: [],
			fId: uuidV4(),
			shared: [],
			listSort: 0,
		};
		return (await listCollection().insertOne(newList)).insertedId;
	};

	const renameList = async (user, list, newLabel) => {
		const filter = getAccessFilter(list._id, user);
		const updateDoc = {
			$set: { label: newLabel },
		};

		const result = await listsCollection.updateOne(filter, updateDoc);
		return result.matchedCount > 0;
	};

	const deleteList = async (user, listId) => {
		const filter = {
			_id: new ObjectId(listId),
			user: new ObjectId(user._id),
		};

		const result = await listCollection().deleteOne(filter);
		return result.deletedCount > 0;
	};

	const addUserToSharedList = async (user, list, sharedWith, allowWrite) => {
		const filter = getAccessFilter(list, user);
		filter['shared.user'] = { $ne: new ObjectId(sharedWith) };

		const updateDoc = {
			$push: { shared: { user: new ObjectId(sharedWith), allowWrite: allowWrite } },
		};

		const result = await listsCollection.updateOne(filter, updateDoc);
		return result.modifiedCount > 0;
	};

	const leaveSharedList = async (user, list) => {
		const filter = {
			_id: new ObjectId(list._id),
			'shared.user': new ObjectId(user._id),
		};
		const updateDoc = {
			$pull: { shared: { user: new ObjectId(user._id) } },
		};

		const result = await listsCollection.updateOne(filter, updateDoc);
		return result.modifiedCount > 0;
	};

	const mutateItem = async (user, listId, item, action) => {
		let filter = getAccessFilter(listId, user);
		let updateDoc;
		let options;

		switch (action) {
			case 'CREATE':
				updateDoc = { $push: { items: item } };
				break;
			case 'UPDATE':
				updateDoc = { $set: { ['items.$[item]']: item } };
				options = {
					arrayFilters: [{ 'item.fId': item.fId }],
				};
				break;
			case 'DELETE':
				updateDoc = { $pull: { items: { fId: item.fId } } };
				break;
		}
		try {
			const result = await listCollection().updateOne(filter, updateDoc, options);

			return result.modifiedCount > 0 || (action === 'DELETE' && result.matchedCount > 0);
		} catch (error) {
			console.error(`MongoDB Mutation Error [${action}]:`, error);
			throw error;
		}
	};

	return {
		connect,
		disconnect,
		heartbeat,
		registerUser,
		findUser,
		updateExisitingUser,
		getLists,
		createList,
		renameList,
		deleteList,
		addUserToSharedList,
		leaveSharedList,
		mutateItem,
	};
};
