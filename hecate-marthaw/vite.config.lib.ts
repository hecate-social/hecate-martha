import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
	plugins: [svelte({ compilerOptions: { css: 'injected' } })],
	resolve: {
		alias: {
			$lib: path.resolve(__dirname, 'src/lib')
		}
	},
	build: {
		lib: {
			entry: 'src/lib/MarthaStudio.svelte',
			formats: ['es'],
			fileName: () => 'component.js'
		},
		outDir: 'dist',
		emptyOutDir: true,
		rollupOptions: {
			// Svelte runtime is provided by hecate-web at runtime
			external: ['svelte', 'svelte/internal', 'svelte/internal/client']
		}
	}
});
