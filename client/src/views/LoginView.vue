<template>
	<div class="auth-container">
		<div class="auth-card">
			<h2>{{ isLoginMode ? 'Welcome Back' : 'Create Account' }}</h2>
			<p class="subtitle">
				{{ isLoginMode ? 'Please sign in to your account' : 'Sign up to get started today' }}
			</p>

			<form @submit.prevent="handleSubmit" class="auth-form">
				<div v-if="!isLoginMode" class="form-group">
					<label for="name">Full Name</label>
					<input id="name" v-model="form.name" type="text" placeholder="John Doe" :class="{ 'input-error': errors.name }" :disabled="isLoading" />
					<span v-if="errors.name" class="error-text">{{ errors.name }}</span>
				</div>

				<div class="form-group">
					<label for="email">Email Address</label>
					<input
						id="email"
						v-model="form.email"
						type="email"
						placeholder="you@example.com"
						:class="{ 'input-error': errors.email }"
						:disabled="isLoading"
					/>
					<span v-if="errors.email" class="error-text">{{ errors.email }}</span>
				</div>

				<div class="form-group">
					<label for="password">Password</label>
					<input
						id="password"
						v-model="form.password"
						type="password"
						placeholder="••••••••"
						:class="{ 'input-error': errors.password }"
						:disabled="isLoading"
					/>
					<span v-if="errors.password" class="error-text">{{ errors.password }}</span>
				</div>

				<div v-if="!isLoginMode" class="form-group">
					<label for="confirmPassword">Confirm Password</label>
					<input
						id="confirmPassword"
						v-model="form.confirmPassword"
						type="password"
						placeholder="••••••••"
						:class="{ 'input-error': errors.confirmPassword }"
						:disabled="isLoading"
					/>
					<span v-if="errors.confirmPassword" class="error-text">{{ errors.confirmPassword }}</span>
				</div>

				<div v-if="apiMessage.text" :class="['alert', apiMessage.isError ? 'alert-error' : 'alert-success']">
					{{ apiMessage.text }}
				</div>

				<button type="submit" :disabled="isLoading" class="btn-submit">
					<span v-if="isLoading">{{ isLoginMode ? 'Signing in...' : 'Creating account...' }}</span>
					<span v-else>{{ isLoginMode ? 'Sign In' : 'Register' }}</span>
				</button>
			</form>

			<div class="toggle-mode">
				<p>
					{{ isLoginMode ? "Don't have an account?" : 'Already have an account?' }}
					<button type="button" @click="toggleMode" :disabled="isLoading" class="btn-toggle">
						{{ isLoginMode ? 'Register here' : 'Login here' }}
					</button>
				</p>
			</div>
		</div>
	</div>
</template>

<script setup>
	import { reactive, ref } from 'vue';
	import { loginUser, registerUser } from '../api/api';
	import { useRouter } from 'vue-router';
	import { useStateStore } from '../store/state-store.js';

	const emit = defineEmits(['auth-success']);
	const router = useRouter();
	const stateStore = useStateStore();

	const isLoginMode = ref(true);
	const isLoading = ref(false);

	const form = reactive({
		name: '',
		email: '',
		password: '',
		confirmPassword: '',
	});

	const errors = reactive({
		name: '',
		email: '',
		password: '',
		confirmPassword: '',
	});

	const apiMessage = reactive({
		text: '',
		isError: false,
	});

	const resetFormAndErrors = () => {
		form.name = '';
		form.email = '';
		form.password = '';
		form.confirmPassword = '';

		errors.name = '';
		errors.email = '';
		errors.password = '';
		errors.confirmPassword = '';

		apiMessage.text = '';
	};

	const toggleMode = () => {
		isLoginMode.value = !isLoginMode.value;
		resetFormAndErrors();
	};

	const validateEmail = (email) => {
		return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
	};

	const handleSubmit = async () => {
		// Clear old errors
		Object.keys(errors).forEach((key) => (errors[key] = ''));
		apiMessage.text = '';

		let isValid = true;

		if (!isLoginMode.value && !form.name.trim()) {
			errors.name = 'Full name is required';
			isValid = false;
		}

		if (!form.email) {
			errors.email = 'Email is required';
			isValid = false;
		} else if (!validateEmail(form.email)) {
			errors.email = 'Please enter a valid email address';
			isValid = false;
		}

		if (!form.password) {
			errors.password = 'Password is required';
			isValid = false;
		} else if (form.password.length < 6) {
			errors.password = 'Password must be at least 6 characters';
			isValid = false;
		}

		if (!isLoginMode.value && form.password !== form.confirmPassword) {
			errors.confirmPassword = 'Passwords do not match';
			isValid = false;
		}

		if (!isValid) {
			return;
		}

		isLoading.value = true;

		try {
			if (isLoginMode.value) {
				stateStore.user = await loginUser({ email: form.email, password: form.password });
				console.log('Logged in ' + JSON.stringify(stateStore.user));
				router.push('/lists');
				console.log('Pushed to router');
			} else {
				await registerUser({ email: form.email, password: form.password });

				apiMessage.text = 'Registration successful! You can now log in.';
				apiMessage.isError = false;
				// Automatically switch to login mode after a short delay
				setTimeout(() => {
					toggleMode();
				}, 2000);
			}
		} catch (err) {
			apiMessage.text = err.message || 'An error occurred. Please try again.';
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

	.auth-form {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	label {
		font-size: 0.875rem;
		font-weight: 500;
		color: #374151;
	}

	input {
		padding: 0.75rem;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		font-size: 1rem;
		transition:
			border-color 0.2s,
			box-shadow 0.2s;
	}

	input:focus {
		outline: none;
		border-color: #4f46e5;
		box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
	}

	input.input-error {
		border-color: #ef4444;
	}

	input:disabled {
		background-color: #f3f4f6;
		cursor: not-allowed;
	}

	.error-text {
		color: #ef4444;
		font-size: 0.75rem;
	}

	.alert {
		padding: 0.75rem;
		border-radius: 6px;
		font-size: 0.875rem;
		text-align: center;
		border: 1px solid;
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

	.btn-submit {
		background-color: #4f46e5;
		color: white;
		padding: 0.75rem;
		border: none;
		border-radius: 6px;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: background-color 0.2s;
		margin-top: 0.5rem;
	}

	.btn-submit:hover:not(:disabled) {
		background-color: #4338ca;
	}

	.btn-submit:disabled {
		background-color: #a5b4fc;
		cursor: not-allowed;
	}

	.toggle-mode {
		margin-top: 1.5rem;
		text-align: center;
		font-size: 0.875rem;
		color: #4b5563;
	}

	.btn-toggle {
		background: none;
		border: none;
		color: #4f46e5;
		font-weight: 600;
		cursor: pointer;
		padding: 0 0.25rem;
		text-decoration: underline;
	}

	.btn-toggle:disabled {
		color: #9ca3af;
		cursor: not-allowed;
	}
</style>
