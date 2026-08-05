import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
	plugins: [vue()],
	server: {
		proxy: {
			'/api': {
				target: 'http://127.0.0.1:8080',
				changeOrigin: true,
			},
			'/event': {
				target: 'http://127.0.0.1:8080',
				changeOrigin: true,
			},
			'/auth/google': {
				target: 'http://127.0.0.1:8080',
				changeOrigin: true,
			},
		},
	},
	build: {
		outDir: '../server/public',
		emptyOutDir: true,
	},
});
