<template>
	<div class="shopping-list-card">
		<button type="button" class="button positive" @click="$router.push('/lists/' + listPreview._id)"><Pencil /></button>
		{{ listPreview.label }} ({{ numberOfItems }} items)
		<button type="button" class="button negative" @click="deleteListAndRemoveFromUI(listPreview._id)"><Trash2 /></button>
	</div>
</template>
<script setup>
	import { computed } from 'vue';
	import { deleteList } from '../api/api';
	import { Trash2, Pencil } from '@lucide/vue';

	const props = defineProps({ listPreview: Object });
	const emit = defineEmits(['delete']);

	const numberOfItems = computed(() => props.listPreview.items.length);

	function deleteListAndRemoveFromUI(listId) {
		deleteList(listId);
		emit('delete');
	}
</script>
<style lang="scss" scoped>
	.shopping-list-card {
		border: 1px solid var(--border);
		border-radius: var(--border-radius);
		display: flex;
		padding: var(--spacing-small);
		align-items: center;
		justify-content: space-between;
		gap: var(--gap);
		flex: 1;
	}
</style>
