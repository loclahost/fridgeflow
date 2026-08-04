<template>
	<div class="shopping-list-item">
		<button @click.stop="() => stateStore.openItemEditor(item)" class="button" type="button">
			<Pencil />
		</button>

		<div class="item-label handle">
			<span>{{ item.label }}</span>
		</div>

		<button @click.stop="stateStore.removeItem(item.fId)" class="button negative" type="button">
			<Trash2 />
		</button>
	</div>
</template>

<script setup>
	import { Trash2, Pencil } from '@lucide/vue';
	import { useStateStore } from '../store/state-store.js';

	const props = defineProps({
		item: {
			type: Object,
			required: true,
		},
	});
	const stateStore = useStateStore();
</script>
<style lang="scss" scoped>
	.shopping-list-item {
		border: 1px solid var(--border);
		border-radius: var(--border-radius);
		display: flex;
		padding: var(--spacing-small);
		gap: var(--spacing-small);
		align-items: center;
		justify-content: space-between;

		.item-label {
			display: flex;
			align-items: center;
			gap: var(--spacing-small);
			flex: 1;
			cursor: ns-resize;
			&.item-done {
				text-decoration-line: line-through;
			}
		}

		.add-wrapper {
			display: flex;
			gap: var(--gap);
			width: 100%;
			input {
				flex: 1;
			}
		}
	}
</style>
