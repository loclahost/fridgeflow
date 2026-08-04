<template>
	<div class="app-wrapper">
		<RouterView />
		<FloatingEditor />
	</div>
</template>

<script setup>
	import { useStateStore } from './store/state-store';
	import FloatingEditor from './components/FloatingEditor.vue';

	const stateStore = useStateStore();

	setInterval(() => {
		if (!stateStore.isUserLoggedIn()) {
			stateStore.user = { token: '', validTo: 0 };
		}
	}, 1000);
</script>
