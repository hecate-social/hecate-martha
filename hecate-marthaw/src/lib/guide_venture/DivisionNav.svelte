<script lang="ts">
	import { divisions, selectedDivisionId } from '$lib/guide_venture/guide_venture.js';
	import { selectedPhase } from '$lib/shared/phaseStore.js';
	import { PHASES } from '$lib/shared/aiStore.js';
	import {
		phaseLabel,
		phaseStatusClass,
		phaseStatus,
		hasFlag,
		PHASE_ACTIVE,
		PHASE_COMPLETED,
		PHASE_PAUSED
	} from '$lib/types.js';
	import type { Division, PhaseCode } from '$lib/types.js';

	function selectDivision(divId: string) {
		selectedDivisionId.set(divId);
	}

	function selectPhase(divId: string, phase: PhaseCode) {
		selectedDivisionId.set(divId);
		selectedPhase.set(phase);
	}

	function phaseIcon(status: number): string {
		if (hasFlag(status, PHASE_COMPLETED)) return '\u{25CF}';
		if (hasFlag(status, PHASE_ACTIVE)) return '\u{25D0}';
		if (hasFlag(status, PHASE_PAUSED)) return '\u{25CB}';
		return '\u{25CB}';
	}
</script>

<div
	class="w-48 border-r border-surface-600 bg-surface-800/30 overflow-y-auto shrink-0"
>
	<div class="p-3">
		<div class="text-[10px] text-surface-400 uppercase tracking-wider mb-2">
			Divisions
		</div>

		{#each $divisions as div}
			{@const isSelected = $selectedDivisionId === div.division_id}
			<div class="mb-2">
				<!-- Division name -->
				<button
					onclick={() => selectDivision(div.division_id)}
					class="w-full text-left px-2 py-1.5 rounded text-xs transition-colors
						{isSelected
						? 'bg-surface-700 text-surface-100'
						: 'text-surface-300 hover:bg-surface-700/50 hover:text-surface-100'}"
				>
					<span class="font-medium">{div.context_name}</span>
				</button>

				<!-- Phase indicators -->
				{#if isSelected}
					<div class="ml-2 mt-1 space-y-0.5">
						{#each PHASES as phase}
							{@const ps = phaseStatus(div, phase.code)}
							<button
								onclick={() => selectPhase(div.division_id, phase.code)}
								class="w-full flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px]
									transition-colors
									{$selectedPhase === phase.code
									? 'bg-surface-600/50 text-surface-100'
									: 'text-surface-400 hover:text-surface-300'}"
							>
								<span class={phaseStatusClass(ps)}>{phaseIcon(ps)}</span>
								<span>{phase.shortName}</span>
								<span class="ml-auto text-[9px] {phaseStatusClass(ps)}">
									{phaseLabel(ps)}
								</span>
							</button>
						{/each}
					</div>
				{/if}
			</div>
		{/each}

		{#if $divisions.length === 0}
			<div class="text-[10px] text-surface-400 px-2 py-4 text-center">
				No divisions yet.
				<br />
				Start discovery to identify them.
			</div>
		{/if}
	</div>
</div>
