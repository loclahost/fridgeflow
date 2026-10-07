import { defineStore } from 'pinia';
import { computed, ref, watch } from 'vue';
import { useLocalStorage } from '@vueuse/core';
import { getList as getListData, removeListItem, updateListItem, createListItem, updateList } from '../api/api';

let eventSource = null;

const setupEventListener = (token) => {
	if (eventSource) {
		eventSource.close();
	}

	if (!token) {
		return;
	}

	eventSource = new EventSource(`/events/${token}`);

	eventSource.onmessage = (event) => {
		try {
			const data = JSON.parse(event.data);
			console.log('Ny uppdatering:', data);
			if (data.eventOrigin == token) {
				console.log('Ignoring my own update');
			} else {
				useStateStore().getList(data.listId);
			}
		} catch (err) {
			console.log('Initialt meddelande eller fel format:', event.data);
		}
	};

	eventSource.onerror = (err) => {
		console.error('SSE-fel:', err);
		eventSource.close();
	};
};

function findItem(list, itemfId) {
	const itemIndex = list.items.findIndex((item) => item.fId === itemfId);

	return { itemIndex, item: itemIndex > -1 ? list.items[itemIndex] : undefined };
}

export const useStateStore = defineStore('state', () => {
	const user = useLocalStorage('user', { token: '', validTo: 0 });
	const list = ref([]);
	const activeEdit = ref(null);
	const groups = computed(() => {
		const groupedObj = Object.groupBy(list.value?.items ?? [], (item) => item.itemType);

		const sortedTypes = Object.keys(groupedObj).sort((a, b) => a.localeCompare(b));

		return sortedTypes.map((itemType) => ({
			itemType,
			items: groupedObj[itemType].toSorted((a, b) => a.label.localeCompare(b.label)),
		}));
	});

	watch(user, () => setupEventListener(user.value?.token));

	function isUserLoggedIn() {
		if (!user.value?.token) {
			console.log('No user');
			return false;
		}

		if (user.value?.validTo <= Date.now()) {
			console.log('Not within alid period (' + user.value?.validTo + ' vs ' + Date.now() + ')');
			return false;
		}

		return true;
	}

	function openListEditor(listId, currentValue) {
		activeEdit.value = {
			type: 'list',
			data: {
				listId,
				label: currentValue,
			},
		};
	}

	function openItemEditor(item) {
		activeEdit.value = {
			type: 'item',
			data: item,
		};
	}

	function closeEditor() {
		activeEdit.value = null;
	}

	async function getList(listId) {
		list.value = await getListData(listId);
	}

	async function renameList(newLabel) {
		console.log('Renaming list ' + list.value.label + ' to ' + newLabel);
		await updateList(list.value._id, newLabel);
		list.value.label = newLabel;
	}

	function createItem(newItem) {
		console.log('Creating item', newItem);
		list.value.items.push(newItem);
		return createListItem(list.value._id, newItem);
	}

	function updateItem(updatedItem) {
		console.log('Updating item', updatedItem);
		const { item } = findItem(list.value, updatedItem.fId);
		item.label = updatedItem.label;
		item.itemType = updatedItem.itemType;
		return updateListItem(list.value._id, updatedItem);
	}

	function removeItem(itemfId) {
		console.log('Removing item', itemfId);
		const { item, itemIndex } = findItem(list.value, itemfId);
		list.value.items.splice(itemIndex, 1);
		return removeListItem(list.value._id, item);
	}

	return {
		user,
		list,
		groups,
		activeEdit,
		isUserLoggedIn,
		getList,
		renameList,
		createItem,
		removeItem,
		updateItem,
		openListEditor,
		openItemEditor,
		closeEditor,
	};
});
