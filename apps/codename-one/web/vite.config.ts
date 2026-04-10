import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { default as tailwindcss } from '@tailwindcss/vite';

export default defineConfig({
	plugins: [react(), tailwindcss()],
});
