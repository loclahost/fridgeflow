import { useStateStore } from '../store/state-store';

function fetchWithAuth(url, method = 'GET', payload) {
	return fetchRaw(url, method, payload, { Authorization: `Bearer ${useStateStore().user?.token}` });
}

function fetchRaw(url, method = 'GET', payload, headers = {}) {
	const options = {};
	options.headers = Object.assign({ 'Content-Type': 'application/json' }, headers);
	options.method = method;
	options.body = JSON.stringify(payload);

	return fetch(url, options)
		.then((response) => {
			if (!response.ok) {
				throw new Error(`Response status: ${response.status}`, response);
			}
			return response.text();
		})
		.then((responseText) => {
			if (!responseText) {
				return Promise.resolve({});
			}
			try {
				return Promise.resolve(JSON.parse(responseText));
			} catch (err) {
				console.log(err);
				return Promise.resolve({});
			}
		});
}

export function registerUser(user) {
	return fetchRaw('/register', 'POST', user);
}

export function loginUser(user) {
	return fetchRaw('/login', 'POST', user);
}

export function getLists() {
	return fetchWithAuth('/api/lists');
}

export function createList(listLabel) {
	return fetchWithAuth('/api/list/create', 'POST', { label: listLabel });
}
export function deleteList(listId) {
	return fetchWithAuth('/api/list/delete/', 'POST', { listId });
}

export function getList(listId) {
	return fetchWithAuth('/api/list/' + listId);
}

export function createListItem(listId, itemPayload) {
	return fetchWithAuth('/api/list/' + listId + '/item', 'POST', {
		action: 'CREATE',
		item: itemPayload,
	});
}

export function removeListItem(listId, itemPayload) {
	return fetchWithAuth('/api/list/' + listId + '/item', 'POST', {
		action: 'DELETE',
		item: itemPayload,
	});
}

export function updateListItem(listId, itemPayload) {
	return fetchWithAuth('/api/list/' + listId + '/item', 'POST', {
		action: 'UPDATE',
		item: itemPayload,
	});
}
