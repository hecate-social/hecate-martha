<script lang="ts">
	import MarthaStudio from '$lib/MarthaStudio.svelte';
	import type { PluginApi } from '$lib/types.js';

	// Dev harness: create a direct HTTP api client for standalone dev
	const devApi: PluginApi = {
		get: async <T>(path: string): Promise<T> => {
			const res = await fetch(`http://localhost:9876${path}`);
			return res.json() as Promise<T>;
		},
		post: async <T>(path: string, body: unknown): Promise<T> => {
			const res = await fetch(`http://localhost:9876${path}`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			return res.json() as Promise<T>;
		},
		del: async <T>(path: string): Promise<T> => {
			const res = await fetch(`http://localhost:9876${path}`, {
				method: 'DELETE'
			});
			return res.json() as Promise<T>;
		}
	};
</script>

<MarthaStudio api={devApi} />
