<template>
	<div>
		<h5>{{ group.itemType }}</h5>
		<ShoppingListItem v-for="item in group.items" :key="item.fId" :item="item" />
	</div>
</template>
<script setup>
	import ShoppingListItem from './ShoppingListItem.vue';

	const props = defineProps({ group: Object });
</script>
<style lang="scss" scoped>
	.shopping-group-label {
		margin: 0 0 0.5rem 0;
	}
</style>
