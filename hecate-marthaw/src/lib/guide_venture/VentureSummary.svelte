<script lang="ts">
	import {
		activeVenture,
		ventureStep,
		startDiscovery,
		isLoading,
		fetchActiveVenture,
		fetchVentures
	} from '$lib/guide_venture/guide_venture.js';

	interface Props {
		nextAction: 'discovery' | 'identify';
	}

	let { nextAction }: Props = $props();

	function formatDate(ts: number): string {
		if (!ts) return '';
		const d = new Date(ts * 1000);
		return d.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	async function handleStartDiscovery() {
		if (!$activeVenture) return;
		const ok = await startDiscovery($activeVenture.venture_id);
		if (ok) {
			await fetchActiveVenture();
			await fetchVentures();
		}
	}

	const LIFECYCLE_STEPS = [
		{ key: 'vision', label: 'Vision', icon: '\u{25C7}' },
		{ key: 'discovery', label: 'Discovery', icon: '\u{25CB}' },
		{ key: 'design', label: 'Design', icon: '\u{25B3}' },
		{ key: 'plan', label: 'Plan', icon: '\u{25A1}' },
		{ key: 'implement', label: 'Implement', icon: '\u{2699}' },
		{ key: 'deploy', label: 'Deploy', icon: '\u{25B2}' },
		{ key: 'monitor', label: 'Monitor', icon: '\u{25C9}' },
		{ key: 'rescue', label: 'Rescue', icon: '\u{21BA}' }
	];

	let currentStepIndex = $derived.by(() => {
		const step = $ventureStep;
		if (step === 'initiated' || step === 'vision_refined' || step === 'vision_submitted')
			return 0;
		if (step === 'discovering' || step === 'discovery_paused' || step === 'discovery_completed')
			return 1;
		return 0;
	});
</script>

<div class="flex flex-col h-full overflow-y-auto">
	<div class="max-w-2xl mx-auto w-full p-8 space-y-6">
		<!-- Venture identity -->
		{#if $activeVenture}
			<div class="text-center">
				<div class="text-3xl mb-3 text-hecate-400">{'\u{25C6}'}</div>
				<h2 class="text-lg font-semibold text-surface-100">{$activeVenture.name}</h2>
				{#if $activeVenture.brief}
					<p class="text-xs text-surface-300 mt-1.5 max-w-md mx-auto">
						{$activeVenture.brief}
					</p>
				{/if}
			</div>

			<!-- Lifecycle progress -->
			<div class="flex items-center justify-center gap-1 py-4">
				{#each LIFECYCLE_STEPS as step, i}
					{@const isComplete = i < currentStepIndex}
					{@const isCurrent = i === currentStepIndex}
					{@const isNext = i === currentStepIndex + 1}
					<div class="flex items-center gap-1">
						<div
							class="flex flex-col items-center gap-0.5 px-2"
							title={step.label}
						>
							<span
								class="text-sm transition-colors
									{isComplete
									? 'text-health-ok'
									: isCurrent
										? 'text-hecate-400'
										: 'text-surface-600'}"
							>
								{isComplete ? '\u{2713}' : step.icon}
							</span>
							<span
								class="text-[9px] transition-colors
									{isComplete
									? 'text-health-ok/70'
									: isCurrent
										? 'text-hecate-300'
										: isNext
											? 'text-surface-400'
											: 'text-surface-600'}"
							>
								{step.label}
							</span>
						</div>
						{#if i < LIFECYCLE_STEPS.length - 1}
							<span
								class="text-[10px]
									{isComplete ? 'text-health-ok/40' : 'text-surface-700'}"
							>{'\u{2192}'}</span>
						{/if}
					</div>
				{/each}
			</div>

			<!-- Venture details -->
			<div class="grid grid-cols-2 gap-3">
				<div class="rounded-lg border border-surface-600 bg-surface-800 p-3">
					<div class="text-[9px] text-surface-400 uppercase tracking-wider mb-1">Status</div>
					<div class="text-xs text-surface-100">{$activeVenture.status_label}</div>
				</div>
				<div class="rounded-lg border border-surface-600 bg-surface-800 p-3">
					<div class="text-[9px] text-surface-400 uppercase tracking-wider mb-1">Initiated</div>
					<div class="text-xs text-surface-100">{formatDate($activeVenture.initiated_at ?? 0)}</div>
				</div>
				{#if $activeVenture.repos && $activeVenture.repos.length > 0}
					<div class="rounded-lg border border-surface-600 bg-surface-800 p-3 col-span-2">
						<div class="text-[9px] text-surface-400 uppercase tracking-wider mb-1">Repository</div>
						<div class="text-xs text-surface-200 font-mono">{$activeVenture.repos[0]}</div>
					</div>
				{/if}
			</div>

			<!-- Next step call to action -->
			{#if nextAction === 'discovery' && $ventureStep === 'vision_submitted'}
				<div class="rounded-lg border border-hecate-600/30 bg-hecate-600/5 p-5 text-center">
					<div class="text-xs text-surface-200 mb-3">
						Your venture repo has been scaffolded. The next step is
						<strong class="text-hecate-300">Big Picture Event Storming</strong>
						{'\u{2014}'} discover the domain events that define your system.
					</div>
					<button
						onclick={handleStartDiscovery}
						disabled={$isLoading}
						class="px-5 py-2.5 rounded-lg text-sm font-medium transition-colors
							{$isLoading
							? 'bg-surface-600 text-surface-400 cursor-not-allowed'
							: 'bg-hecate-600 text-surface-50 hover:bg-hecate-500'}"
					>
						{$isLoading ? 'Starting...' : 'Start Discovery'}
					</button>
				</div>
			{:else if nextAction === 'identify'}
				<div class="rounded-lg border border-surface-600 bg-surface-800 p-5 text-center">
					<div class="text-xs text-surface-200 mb-2">
						Discovery is complete. Identify divisions (bounded contexts)
						from the events you discovered.
					</div>
					<div class="text-[10px] text-surface-400">
						Use the header controls to identify divisions.
					</div>
				</div>
			{:else}
				<div class="rounded-lg border border-surface-600 bg-surface-800 p-5 text-center">
					<div class="text-xs text-surface-200">
						Continue from the header controls to advance through the lifecycle.
					</div>
				</div>
			{/if}
		{/if}
	</div>
</div>
