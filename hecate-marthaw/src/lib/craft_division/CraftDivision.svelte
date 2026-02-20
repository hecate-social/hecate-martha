<script lang="ts">
	import { selectedDivision, isLoading } from '$lib/guide_venture/guide_venture.js';
	import { generateModule, generateTests } from '$lib/craft_division/craft_division.js';
	import TaskCard from '$lib/shared/TaskCard.svelte';

	let showGenForm = $state(false);
	let moduleName = $state('');
	let template = $state('');

	async function handleGenerate() {
		if (!$selectedDivision || !moduleName.trim()) return;
		const ok = await generateModule($selectedDivision.division_id, {
			module_name: moduleName.trim(),
			template: template.trim() || undefined
		});
		if (ok) {
			moduleName = '';
			template = '';
			showGenForm = false;
		}
	}
</script>

<div class="p-4 space-y-6">
	<div>
		<h3 class="text-sm font-semibold text-surface-100">
			Testing & Implementation
		</h3>
		<p class="text-[11px] text-surface-400 mt-0.5">
			Generate code, execute tests, and validate acceptance criteria for
			<span class="text-surface-200">{$selectedDivision?.context_name}</span>
		</p>
	</div>

	<!-- Code Generation -->
	<div class="rounded-lg border border-surface-600 bg-surface-800/50 p-4">
		<div class="flex items-center justify-between mb-3">
			<h4 class="text-xs font-semibold text-surface-100">Code Generation</h4>
			<button
				onclick={() => (showGenForm = !showGenForm)}
				class="text-[10px] px-2 py-0.5 rounded bg-phase-tni/10 text-phase-tni
					hover:bg-phase-tni/20 transition-colors"
			>
				+ Generate Module
			</button>
		</div>

		{#if showGenForm}
			<div class="flex gap-2 items-end mb-4 p-3 rounded bg-surface-700/30">
				<div class="flex-1">
					<label for="mod-name" class="text-[10px] text-surface-400 block mb-1"
						>Module Name</label
					>
					<input
						id="mod-name"
						bind:value={moduleName}
						placeholder="e.g., register_user_v1"
						class="w-full bg-surface-700 border border-surface-600 rounded
							px-2.5 py-1.5 text-xs text-surface-100 placeholder-surface-400
							focus:outline-none focus:border-phase-tni/50"
					/>
				</div>
				<div class="flex-1">
					<label for="mod-template" class="text-[10px] text-surface-400 block mb-1"
						>Template (optional)</label
					>
					<input
						id="mod-template"
						bind:value={template}
						placeholder="e.g., command, event, handler"
						class="w-full bg-surface-700 border border-surface-600 rounded
							px-2.5 py-1.5 text-xs text-surface-100 placeholder-surface-400
							focus:outline-none focus:border-phase-tni/50"
					/>
				</div>
				<button
					onclick={handleGenerate}
					disabled={!moduleName.trim() || $isLoading}
					class="px-3 py-1.5 rounded text-xs bg-phase-tni/20 text-phase-tni
						hover:bg-phase-tni/30 transition-colors disabled:opacity-50"
				>
					Generate
				</button>
				<button
					onclick={() => (showGenForm = false)}
					class="px-3 py-1.5 rounded text-xs text-surface-400 hover:text-surface-100"
				>
					Cancel
				</button>
			</div>
		{/if}

		<p class="text-[10px] text-surface-400">
			Generate Erlang modules from templates based on planned desks and design
			artifacts.
		</p>
	</div>

	<!-- TnI Tasks -->
	<div>
		<h4 class="text-xs font-semibold text-surface-100 mb-3">
			Implementation Tasks
		</h4>
		<div class="grid grid-cols-1 md:grid-cols-2 gap-3">
			<TaskCard
				title="Walking Skeleton"
				description="Generate initiate + archive desks first, establishing the aggregate lifecycle foundation"
				icon={'\u{26B2}'}
				aiContext={`Help me implement the walking skeleton for the "${$selectedDivision?.context_name}" division. We need initiate_{aggregate} and archive_{aggregate} desks first. Generate the Erlang module structure for each.`}
			/>
			<TaskCard
				title="Generate Commands"
				description="Create command modules from the desk inventory with proper versioning"
				icon={'\u{25B6}'}
				aiContext={`Help me generate Erlang command modules for the "${$selectedDivision?.context_name}" division. Each command needs: module, record, to_map/1, from_map/1. Use the evoq command pattern.`}
			/>
			<TaskCard
				title="Generate Events"
				description="Create event modules matching the designed domain events"
				icon={'\u{25C6}'}
				aiContext={`Help me generate Erlang event modules for the "${$selectedDivision?.context_name}" division. Each event needs: module, record, to_map/1, from_map/1. Follow the event naming convention: {subject}_{verb_past}_v{N}.`}
			/>
			<TaskCard
				title="Write Tests"
				description="Generate EUnit test modules for aggregates, handlers, and projections"
				icon={'\u{2713}'}
				aiContext={`Help me write EUnit tests for the "${$selectedDivision?.context_name}" division. Cover aggregate behavior (execute + apply), handler dispatch, and projection state updates.`}
			/>
			<TaskCard
				title="Run Test Suite"
				description="Execute all tests and review results for quality gates"
				icon={'\u{25B7}'}
				aiContext={`Help me analyze test results for the "${$selectedDivision?.context_name}" division. What patterns should I look for? How do I ensure adequate coverage of the aggregate lifecycle?`}
			/>
			<TaskCard
				title="Acceptance Criteria"
				description="Validate that implementation meets the design specifications"
				icon={'\u{2611}'}
				aiContext={`Help me define acceptance criteria for the "${$selectedDivision?.context_name}" division. What must be true before we can say this division is implemented correctly?`}
			/>
		</div>
	</div>
</div>
