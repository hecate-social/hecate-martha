import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [svelte({ compilerOptions: { css: 'injected' } })],
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
