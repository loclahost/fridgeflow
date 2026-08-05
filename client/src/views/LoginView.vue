<template>
	<div class="auth-container">
		<div class="auth-card">
			<h2>Welcome</h2>
			<p class="subtitle">Sign in or register with your Google account</p>

			<div v-if="apiMessage.text" :class="['alert', apiMessage.isError ? 'alert-error' : 'alert-success']">
				{{ apiMessage.text }}
			</div>

			<!-- Google Sign-In Button Container -->
			<div class="google-btn-wrapper">
				<div id="google-signin-btn"></div>
			</div>

			<p v-if="isLoading" class="loading-text">Authenticating with Google...</p>
		</div>
	</div>
</template>

<script setup>
	import { ref, reactive, onMounted } from 'vue';
	import { useRouter } from 'vue-router';
	import { useStateStore } from '../store/state-store.js';

	const router = useRouter();
	const stateStore = useStateStore();

	const isLoading = ref(false);
	const apiMessage = reactive({
		text: '',
		isError: false,
	});

	onMounted(() => {
		if (window.google) {
			window.google.accounts.id.initialize({
				client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
				callback: handleGoogleCredentialResponse,
			});

			window.google.accounts.id.renderButton(document.getElementById('google-signin-btn'), { theme: 'outline', size: 'large', width: '100%' });
		} else {
			apiMessage.text = 'Google SDK failed to load. Please check your connection.';
			apiMessage.isError = true;
		}
	});

	const handleGoogleCredentialResponse = async (response) => {
		isLoading.value = true;
		apiMessage.text = '';

		try {
			const res = await fetch('/auth/google', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ idToken: response.credential }),
			});

			const data = await res.json();

			if (!res.ok) {
				throw new Error(data.error || 'Failed to authenticate');
			}

			stateStore.user = data;
			if (data.token) {
				localStorage.setItem('token', data.token);
			}

			router.push('/lists');
		} catch (err) {
			apiMessage.text = err.message || 'Authentication error. Please try again.';
			apiMessage.isError = true;
		} finally {
			isLoading.value = false;
		}
	};
</script>

<style scoped>
	.auth-container {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 100vh;
		font-family:
			system-ui,
			-apple-system,
			sans-serif;
	}

	.auth-card {
		background: #ffffff;
		padding: 2.5rem;
		border-radius: 12px;
		box-shadow:
			0 4px 6px -1px rgba(0, 0, 0, 0.1),
			0 2px 4px -1px rgba(0, 0, 0, 0.06);
		width: 100%;
		max-width: 400px;
	}

	h2 {
		margin: 0 0 0.5rem 0;
		color: #1f2937;
		font-size: 1.75rem;
		text-align: center;
	}

	.subtitle {
		color: #6b7280;
		text-align: center;
		margin-bottom: 2rem;
		font-size: 0.9rem;
	}

	.google-btn-wrapper {
		display: flex;
		justify-content: center;
		margin-top: 1rem;
		min-height: 44px;
	}

	.loading-text {
		text-align: center;
		margin-top: 1rem;
		color: #6b7280;
		font-size: 0.875rem;
	}

	.alert {
		padding: 0.75rem;
		border-radius: 6px;
		font-size: 0.875rem;
		text-align: center;
		border: 1px solid;
		margin-bottom: 1rem;
	}

	.alert-error {
		background-color: #ffeeef;
		color: #dc2626;
		border-color: #fca5a5;
	}

	.alert-success {
		background-color: #f0fdf4;
		color: #16a34a;
		border-color: #bbf7d0;
	}
</style>
