<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type { PluginApi, HealthData } from './types.js';
	import { setApi } from './shared/api.js';

	let { api }: { api: PluginApi } = $props();

	let health: HealthData | null = $state(null);
	let connectionStatus: 'connected' | 'connecting' | 'disconnected' = $state('connecting');
	let pollTimer: ReturnType<typeof setInterval> | undefined;

	async function fetchHealth() {
		try {
			health = await api.get<HealthData>('/health');
			connectionStatus = 'connected';
		} catch {
			health = null;
			connectionStatus = 'disconnected';
		}
	}

	onMount(() => {
		setApi(api);
		fetchHealth();
		pollTimer = setInterval(fetchHealth, 5000);
	});

	onDestroy(() => {
		if (pollTimer) clearInterval(pollTimer);
	});
</script>

<div class="flex flex-col gap-6 p-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div class="flex items-center gap-3">
			<span class="text-3xl">{'\u{1F9D9}'}</span>
			<div>
				<h1 class="text-xl font-bold text-surface-50">Martha</h1>
				<p class="text-xs text-surface-400">ALC/DevOps Agent</p>
			</div>
		</div>
		<div class="flex items-center gap-2 text-xs">
			<span
				class="inline-block w-2 h-2 rounded-full {connectionStatus === 'connected'
					? 'bg-success-400'
					: connectionStatus === 'connecting'
						? 'bg-yellow-400 animate-pulse'
						: 'bg-danger-400'}"
			></span>
			<span class="text-surface-400">
				{connectionStatus === 'connected'
					? `v${health?.version ?? '?'}`
					: connectionStatus}
			</span>
		</div>
	</div>

	<!-- ALC Phases -->
	<div class="grid grid-cols-1 md:grid-cols-4 gap-4">
		<div class="bg-surface-800 border border-surface-700 rounded-lg p-4">
			<h2 class="text-sm font-bold text-surface-300 mb-2">Ventures</h2>
			<p class="text-2xl font-bold text-surface-50">--</p>
			<p class="text-xs text-surface-500 mt-1">Venture lifecycle management</p>
		</div>

		<div class="bg-surface-800 border border-surface-700 rounded-lg p-4">
			<h2 class="text-sm font-bold text-surface-300 mb-2">Divisions</h2>
			<p class="text-2xl font-bold text-surface-50">--</p>
			<p class="text-xs text-surface-500 mt-1">Division ALC phases</p>
		</div>

		<div class="bg-surface-800 border border-surface-700 rounded-lg p-4">
			<h2 class="text-sm font-bold text-surface-300 mb-2">Active Phase</h2>
			<p class="text-2xl font-bold text-surface-50">--</p>
			<p class="text-xs text-surface-500 mt-1">Current development phase</p>
		</div>

		<div class="bg-surface-800 border border-surface-700 rounded-lg p-4">
			<h2 class="text-sm font-bold text-surface-300 mb-2">Events</h2>
			<p class="text-2xl font-bold text-surface-50">--</p>
			<p class="text-xs text-surface-500 mt-1">Domain events tracked</p>
		</div>
	</div>

	<!-- Getting started -->
	<div class="bg-surface-800 border border-surface-700 rounded-lg p-6">
		<h2 class="text-lg font-bold text-surface-50 mb-3">Martha - ALC/DevOps Agent</h2>
		<p class="text-sm text-surface-400 leading-relaxed">
			Martha guides you through the full Application Lifecycle (ALC): from vision
			and event storming through design, planning, generation, testing, deployment,
			and monitoring. Each phase is a structured process with its own tools and views.
		</p>
		<div class="mt-4 flex gap-3">
			<div class="text-xs bg-surface-900 border border-surface-600 rounded px-3 py-2 text-surface-300">
				Daemon: {connectionStatus === 'connected' ? 'Online' : 'Offline'}
			</div>
		</div>
	</div>
</div>
