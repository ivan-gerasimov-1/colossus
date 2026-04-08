import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
	plugins: [
		react(),
		tailwindcss(),
		VitePWA({
			registerType: 'autoUpdate',
			includeAssets: ['icon.svg'],
			manifest: {
				name: 'Codename ONE',
				short_name: 'ONE',
				description: 'Codename ONE Application',
				theme_color: '#242424',
				background_color: '#242424',
				display: 'standalone',
				orientation: 'portrait',
				icons: [
					{
						src: 'icon.svg',
						sizes: '512x512',
						type: 'image/svg+xml',
						purpose: 'any maskable',
					},
				],
			},
			workbox: {
				globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
				runtimeCaching: [],
			},
		}),
	],
});
