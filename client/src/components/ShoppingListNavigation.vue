<template>
	<div class="list-navigation-wrapper" ref="navigationRef">
		<nav class="list-navigation">
			<button @click="$router.push('/lists')" class="button" type="button" aria-label="Tillbaka till listor">
				<ChevronLeft />
			</button>

			<button type="button" class="button text" @click.stop="() => stateStore.openListEditor(stateStore.list._id, stateStore.list.label)">
				<h1>{{ stateStore.list.label }}</h1>
			</button>

			<button @click.stop="() => stateStore.openItemEditor(stateStore.list._id)" class="button positive" type="button" aria-label="Lägg till vara">
				<ListPlus />
			</button>
		</nav>
	</div>
</template>
<script setup>
	import { ChevronLeft, ListPlus } from '@lucide/vue';
	import { useTemplateRef } from 'vue';
	import { useStateStore } from '../store/state-store.js';

	const navigationRef = useTemplateRef('navigationRef');
	const stateStore = useStateStore();
</script>
<style lang="scss" scoped>
	.list-navigation-wrapper {
		padding: var(--spacing-small);
		display: flex;
		flex-direction: column;
		gap: var(--gap);

		.list-navigation {
			display: flex;
			flex-direction: row;
			align-items: center;
			justify-content: space-between;

			h1 {
				margin-top: 0.3rem;
				margin-bottom: 0.3rem;
			}
		}
	}
</style>
