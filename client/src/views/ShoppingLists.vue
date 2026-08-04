<template>
	<div class="lists-wrapper">
		<nav class="menu">
			<RouterLink to="/lists">My lists</RouterLink>
			<RouterLink to="/account">Account</RouterLink>
		</nav>
		<div class="shopping-list-card-list">
			<ShoppingListCard v-for="list in lists" :key="list.fId" :list-preview="list" @delete="() => handleDeleteList(list._id)" />

			<!-- Sticky container wrapper -->
			<div class="fab-wrapper">
				<button class="fab-btn" @click="handleAddList"><FilePlus /></button>
			</div>
		</div>
	</div>
</template>

<script setup>
	import { getLists } from '../api/api';
	import { ref } from 'vue';
	import { useStateStore } from '../store/state-store.js';
	import ShoppingListCard from '../components/ShoppingListCard.vue';
	import { FilePlus } from '@lucide/vue';

	const stateStore = useStateStore();

	const lists = ref([]);
	console.log('loaded');
	getLists()
		.then((response) => (lists.value = response))
		.catch((err) => console.log(err));

	function handleAddList() {
		stateStore.openListEditor();
	}

	function handleDeleteList(listId) {
		const index = lists.value.findIndex((item) => item._id === listId);
		if (index > -1) {
			lists.value.splice(index, 1);
		}
	}
</script>

<style lang="scss" scoped>
	.lists-wrapper {
		width: 100%;

		.menu {
			padding: var(--spacing-small);

			a {
				padding: var(--spacing-small);
				&:hover {
					background-color: var(--positive-bg-hover);
				}
			}
		}
	}
	.shopping-list-card-list {
		display: flex;
		flex-direction: column;
		gap: 2rem;
		position: relative; /* Context for alignment */
	}

	.fab-wrapper {
		position: sticky;
		bottom: 2rem;
		display: flex;
		justify-content: flex-end; /* Aligns button to the right */
		pointer-events: none; /* Prevents container from blocking clicks behind it */
		z-index: 10;
	}

	.fab-btn {
		pointer-events: auto; /* Re-enables clicks on the button itself */
		width: 3.5rem;
		height: 3.5rem;
		border-radius: 50%;
		background-color: #42b883;
		color: white;
		font-size: 1.5rem;
		border: none;
		box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: transform 0.2s ease;

		&:hover {
			transform: scale(1.05);
		}
	}
</style>
