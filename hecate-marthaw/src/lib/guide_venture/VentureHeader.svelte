<script lang="ts">
	import {
		activeVenture,
		ventures,
		ventureStep,
		ventureError,
		isLoading,
		startDiscovery,
		pauseDiscovery,
		resumeDiscovery,
		completeDiscovery,
		identifyDivision,
		selectVenture,
		clearActiveVenture,
		divisions
	} from '$lib/guide_venture/guide_venture.js';
	import { refineVision, submitVision } from '$lib/compose_vision/compose_vision.js';
	import { hasFlag, VL_DISCOVERING, VL_DISCOVERY_PAUSED, VL_ARCHIVED } from '$lib/types.js';

	let showRefineForm = $state(false);
	let showIdentifyForm = $state(false);
	let showVenturePicker = $state(false);
	let refineBrief = $state('');
	let divisionName = $state('');
	let divisionDesc = $state('');

	async function handleRefine() {
		if (!$activeVenture || !refineBrief.trim()) return;
		const ok = await refineVision($activeVenture.venture_id, refineBrief.trim());
		if (ok) {
			showRefineForm = false;
			refineBrief = '';
		}
	}

	async function handleSubmit() {
		if (!$activeVenture) return;
		await submitVision($activeVenture.venture_id, $activeVenture.vision ?? '');
	}

	async function handleStartDiscovery() {
		if (!$activeVenture) return;
		await startDiscovery($activeVenture.venture_id);
	}

	async function handleIdentify() {
		if (!$activeVenture || !divisionName.trim()) return;
		const ok = await identifyDivision(
			$activeVenture.venture_id,
			divisionName.trim(),
			divisionDesc.trim() || undefined
		);
		if (ok) {
			showIdentifyForm = false;
			divisionName = '';
			divisionDesc = '';
		}
	}

	function stepColor(step: string): string {
		switch (step) {
			case 'discovering':
				return 'bg-hecate-600/20 text-hecate-300 border-hecate-600/40';
			case 'discovery_completed':
				return 'bg-health-ok/10 text-health-ok border-health-ok/30';
			case 'discovery_paused':
				return 'bg-health-warn/10 text-health-warn border-health-warn/30';
			default:
				return 'bg-surface-700 text-surface-300 border-surface-600';
		}
	}
</script>

<div class="border-b border-surface-600 bg-surface-800/50 px-4 py-3 shrink-0">
	<div class="flex items-center gap-3">
		<!-- Back to browser -->
		<button
			onclick={() => clearActiveVenture()}
			class="flex items-center gap-1 text-xs text-surface-400 hover:text-hecate-300
				transition-colors shrink-0 -ml-1 px-1.5 py-1 rounded hover:bg-surface-700"
		>
			<span class="text-sm">{'\u{2190}'}</span>
			<span>Ventures</span>
		</button>

		<span class="text-surface-600 text-xs">|</span>

		<!-- Venture name + switcher -->
		<div class="relative flex items-center gap-2">
			<span class="text-hecate-400 text-lg">{'\u{25C6}'}</span>
			<button
				onclick={() => (showVenturePicker = !showVenturePicker)}
				class="flex items-center gap-1.5 text-sm font-semibold text-surface-100
					hover:text-hecate-300 transition-colors"
			>
				{$activeVenture?.name ?? 'Venture'}
				<span class="text-[9px] text-surface-400">{'\u{25BE}'}</span>
			</button>

			{#if showVenturePicker}
				<div
					class="absolute top-full left-0 mt-1 z-20 min-w-[220px]
						bg-surface-700 border border-surface-600 rounded-lg shadow-lg overflow-hidden"
				>
					{#each $ventures.filter((v) => !(v.status & VL_ARCHIVED)) as v}
						<button
							onclick={() => { selectVenture(v); showVenturePicker = false; }}
							class="w-full text-left px-3 py-2 text-xs transition-colors
								{v.venture_id === $activeVenture?.venture_id
								? 'bg-hecate-600/20 text-hecate-300'
								: 'text-surface-200 hover:bg-surface-600'}"
						>
							<div class="font-medium">{v.name}</div>
							{#if v.brief}
								<div class="text-[10px] text-surface-400 truncate mt-0.5">
									{v.brief}
								</div>
							{/if}
						</button>
					{/each}
					<button
						onclick={() => { clearActiveVenture(); showVenturePicker = false; }}
						class="w-full text-left px-3 py-2 text-xs text-hecate-400
							hover:bg-hecate-600/20 transition-colors border-t border-surface-600"
					>
						+ New Venture
					</button>
				</div>
			{/if}
		</div>

		<!-- Status badge -->
		<span
			class="text-[10px] px-2 py-0.5 rounded-full border {stepColor($ventureStep)}"
		>
			{$activeVenture?.status_label ?? 'New'}
		</span>

		<!-- Brief (if set) -->
		{#if $activeVenture?.brief}
			<span class="text-[11px] text-surface-400 truncate max-w-[300px]">
				{$activeVenture.brief}
			</span>
		{/if}

		<div class="flex-1"></div>

		<!-- Division count -->
		{#if $divisions.length > 0}
			<span class="text-[10px] text-surface-400">
				{$divisions.length} division{$divisions.length !== 1 ? 's' : ''}
			</span>
		{/if}

		<!-- Context actions based on step -->
		{#if $ventureStep === 'initiated' || $ventureStep === 'vision_refined'}
			<span class="text-[10px] text-surface-400 italic">Oracle active</span>
		{:else if $ventureStep === 'vision_submitted'}
			<button
				onclick={handleStartDiscovery}
				disabled={$isLoading}
				class="text-[11px] px-2.5 py-1 rounded bg-hecate-600/20 text-hecate-300
					hover:bg-hecate-600/30 transition-colors disabled:opacity-50"
			>
				Start Discovery
			</button>
		{:else if $ventureStep === 'discovering'}
			<button
				onclick={() => (showIdentifyForm = !showIdentifyForm)}
				disabled={$isLoading}
				class="text-[11px] px-2.5 py-1 rounded bg-hecate-600/20 text-hecate-300
					hover:bg-hecate-600/30 transition-colors disabled:opacity-50"
			>
				+ Identify Division
			</button>
			<button
				onclick={() => $activeVenture && pauseDiscovery($activeVenture.venture_id)}
				disabled={$isLoading}
				class="text-[11px] px-2 py-1 rounded text-surface-400
					hover:text-health-warn hover:bg-surface-700 transition-colors disabled:opacity-50"
			>
				Pause
			</button>
			{#if $divisions.length > 0}
				<button
					onclick={() => $activeVenture && completeDiscovery($activeVenture.venture_id)}
					disabled={$isLoading}
					class="text-[11px] px-2 py-1 rounded text-surface-400
						hover:text-health-ok hover:bg-surface-700 transition-colors disabled:opacity-50"
				>
					Complete Discovery
				</button>
			{/if}
		{:else if $ventureStep === 'discovery_paused'}
			<button
				onclick={() => $activeVenture && resumeDiscovery($activeVenture.venture_id)}
				disabled={$isLoading}
				class="text-[11px] px-2.5 py-1 rounded bg-health-warn/10 text-health-warn
					hover:bg-health-warn/20 transition-colors disabled:opacity-50"
			>
				Resume Discovery
			</button>
		{/if}
	</div>

	<!-- Error display -->
	{#if $ventureError}
		<div class="mt-2 text-[11px] text-health-err bg-health-err/10 rounded px-3 py-1.5">
			{$ventureError}
		</div>
	{/if}

	<!-- Inline forms -->
	{#if showRefineForm}
		<div class="mt-3 flex gap-2 items-end">
			<div class="flex-1">
				<label for="refine-brief" class="text-[10px] text-surface-400 block mb-1"
					>Vision Brief</label
				>
				<textarea
					id="refine-brief"
					bind:value={refineBrief}
					placeholder="Describe what this venture aims to achieve..."
					rows={2}
					class="w-full bg-surface-700 border border-surface-600 rounded px-3 py-2 text-xs
						text-surface-100 placeholder-surface-400 resize-none
						focus:outline-none focus:border-hecate-500"
				></textarea>
			</div>
			<button
				onclick={handleRefine}
				disabled={!refineBrief.trim() || $isLoading}
				class="px-3 py-2 rounded text-xs bg-hecate-600 text-surface-50
					hover:bg-hecate-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
			>
				Refine
			</button>
			<button
				onclick={() => (showRefineForm = false)}
				class="px-3 py-2 rounded text-xs text-surface-400 hover:text-surface-100 transition-colors"
			>
				Cancel
			</button>
		</div>
	{/if}

	{#if showIdentifyForm}
		<div class="mt-3 flex gap-2 items-end">
			<div class="flex-1">
				<label for="div-name" class="text-[10px] text-surface-400 block mb-1"
					>Context Name</label
				>
				<input
					id="div-name"
					bind:value={divisionName}
					placeholder="e.g., authentication, billing, notifications"
					class="w-full bg-surface-700 border border-surface-600 rounded px-3 py-1.5 text-xs
						text-surface-100 placeholder-surface-400
						focus:outline-none focus:border-hecate-500"
				/>
			</div>
			<div class="flex-1">
				<label for="div-desc" class="text-[10px] text-surface-400 block mb-1"
					>Description (optional)</label
				>
				<input
					id="div-desc"
					bind:value={divisionDesc}
					placeholder="Brief description of this bounded context"
					class="w-full bg-surface-700 border border-surface-600 rounded px-3 py-1.5 text-xs
						text-surface-100 placeholder-surface-400
						focus:outline-none focus:border-hecate-500"
				/>
			</div>
			<button
				onclick={handleIdentify}
				disabled={!divisionName.trim() || $isLoading}
				class="px-3 py-1.5 rounded text-xs bg-hecate-600 text-surface-50
					hover:bg-hecate-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
			>
				Identify
			</button>
			<button
				onclick={() => (showIdentifyForm = false)}
				class="px-3 py-1.5 rounded text-xs text-surface-400 hover:text-surface-100 transition-colors"
			>
				Cancel
			</button>
		</div>
	{/if}
</div>
