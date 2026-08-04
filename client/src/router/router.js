import { createWebHistory, createRouter } from 'vue-router';
import ShoppingList from '../views/ShoppingList.vue';
import ShoppingLists from '../views/ShoppingLists.vue';
import LoginView from '../views/LoginView.vue';
import { useStateStore } from '../store/state-store';

const routes = [
	{ path: '/lists', component: ShoppingLists },
	{ path: '/lists/:id', component: ShoppingList, props: true },
	{ path: '/login', component: LoginView, name: 'Login' },
];

const router = createRouter({
	history: createWebHistory(),
	routes,
});

router.beforeEach((to, from) => {
	const stateStore = useStateStore();
	if (!stateStore.isUserLoggedIn() && to.name !== 'Login') {
		console.log(JSON.stringify(stateStore.user) + ' not logged in');
		return { name: 'Login' };
	}
});

export { router };
