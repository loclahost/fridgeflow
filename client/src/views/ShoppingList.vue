<template>
	<div class="shopping-list">
		<ShoppingListNavigation />
		<div class="group-wrapper">
			<ShoppingListGroup v-for="group in stateStore.groups" :key="group.itemType" :group="group" />
		</div>
	</div>
</template>

<script setup>
	import { onMounted } from 'vue';
	import { getList } from '../api/api';
	import { useStateStore } from '../store/state-store.js';
	import ShoppingListGroup from '../components/ShoppingListGroup.vue';
	import ShoppingListNavigation from '../components/ShoppingListNavigation.vue';

	const props = defineProps({ id: String });
	const stateStore = useStateStore();
	onMounted(async () => {
		stateStore.list = await getList(props.id);
	});
</script>
<style lang="scss" scoped>
	.shopping-list {
		min-width: 20rem;

		.group-wrapper {
			display: flex;
			flex-direction: column;
			gap: var(--gap);
		}
	}
</style>
