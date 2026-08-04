<template>
	<Transition name="slide-up">
		<div v-if="store.activeEdit" class="floating-editor-overlay">
			<div class="editor-card">
				<div class="editor-header">
					<span>
						{{ editorName }}
					</span>

					<button @click="store.closeEditor" class="close-btn">
						<X />
					</button>
				</div>

				<div class="editor-body">
					<input ref="inputRef" type="text" v-model="localData.label" @keyup.enter="handleUpdate" placeholder="Namn..." />
					<input type="text" v-if="type === 'item'" v-model="localData.itemType" @keyup.enter="handleUpdate" placeholder="Typ..." />
					<div class="action-row">
						<button @click="handleUpdate" class="save-button"><Check /> Spara</button>
					</div>
				</div>
			</div>
		</div>
	</Transition>
</template>

<script setup>
	import { ref, watch, nextTick, computed } from 'vue';
	import { useStateStore } from '../store/state-store.js';
	import { Check, X } from '@lucide/vue';
	import { useRouter } from 'vue-router';
	import { createList } from '../api/api';
	import { v4 as uuidv4 } from 'uuid';

	const router = useRouter();
	const store = useStateStore();
	const type = ref('item');
	const localData = ref({ label: '' });
	const inputRef = ref(null);

	const editorName = computed(() => {
		const { type, listId, itemId } = store.activeEdit;
		switch (type) {
			case 'item':
				return itemId ? 'Ändra vara' : 'Skapa vara';
			case 'list':
				return !!listId ? 'Ändra lista' : 'Skapa lista';
		}
		return 'Nu blev det fel';
	});

	watch(
		() => store.activeEdit,
		async (newVal) => {
			if (newVal) {
				type.value = newVal.type;
				localData.value = { label: newVal.data.label, itemType: newVal.data.itemType, fId: newVal.data.fId, listId: newVal.data.listId };
				await nextTick();
				inputRef.value?.focus();
			}
		}
	);

	async function handleUpdate() {
		if (!localData.value.label.trim()) return;

		if (type.value === 'item') {
			if (localData.value.fId) {
				store.updateItem(localData.value);
			} else {
				store.createItem(Object.assign(localData.value, { fId: uuidv4() }));
			}
		} else {
			if (!localData.value.listId) {
				const { listId: newListId } = await createList(localData.value.label);
				router.push('/lists/' + newListId);
			}
		}

		store.closeEditor();
	}
</script>

<style scoped lang="scss">
	.floating-editor-overlay {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		padding: 1rem;
		z-index: 1000;
		background: linear-gradient(transparent, rgba(0, 0, 0, 0.2));
		display: flex;
		justify-content: center;
	}

	.editor-card {
		background: white;
		width: 100%;
		max-width: 500px;
		border-radius: 1rem 1rem 0.5rem 0.5rem;
		box-shadow: 0 -10px 25px rgba(0, 0, 0, 0.15);
		padding: 1.5rem;
		border: 1px solid var(--border);
	}

	.editor-header {
		display: flex;
		justify-content: space-between;
		margin-bottom: 1rem;
		font-weight: bold;
		color: var(--text-muted);
	}

	.editor-body {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;

		input,
		button {
			flex: 1;
			padding: 0.75rem;
			border: 2px solid var(--border);
			border-radius: 0.5rem;
			font-size: 1rem;
		}
		.action-row {
			display: flex;
			justify-content: flex-end;
		}
		.save-button {
			background: var(--positive-color, #28a745);
			color: white;
			border: none;
			display: flex;
			align-items: center;
			gap: 0.5rem;
			cursor: pointer;
			flex: 0;
		}
	}

	/* Animation */
	.slide-up-enter-active,
	.slide-up-leave-active {
		transition:
			transform 0.3s ease,
			opacity 0.3s ease;
	}
	.slide-up-enter-from,
	.slide-up-leave-to {
		transform: translateY(100%);
		opacity: 0;
	}
</style>
