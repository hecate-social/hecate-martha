<script lang="ts">
	import { selectedDivision, isLoading } from '$lib/guide_venture/guide_venture.js';
	import { planDesk } from '$lib/plan_division/plan_division.js';
	import TaskCard from '$lib/shared/TaskCard.svelte';

	let showDeskForm = $state(false);
	let deskName = $state('');
	let deskDesc = $state('');
	let deskDept = $state('cmd');

	async function handlePlanDesk() {
		if (!$selectedDivision || !deskName.trim()) return;
		const ok = await planDesk($selectedDivision.division_id, {
			desk_name: deskName.trim(),
			description: deskDesc.trim() || undefined,
			department: deskDept
		});
		if (ok) {
			deskName = '';
			deskDesc = '';
			showDeskForm = false;
		}
	}
</script>

<div class="p-4 space-y-6">
	<div>
		<h3 class="text-sm font-semibold text-surface-100">
			Architecture & Planning
		</h3>
		<p class="text-[11px] text-surface-400 mt-0.5">
			Plan desks, map dependencies, and sequence implementation for
			<span class="text-surface-200">{$selectedDivision?.context_name}</span>
		</p>
	</div>

	<!-- Plan a Desk -->
	<div class="rounded-lg border border-surface-600 bg-surface-800/50 p-4">
		<div class="flex items-center justify-between mb-3">
			<h4 class="text-xs font-semibold text-surface-100">Desk Inventory</h4>
			<button
				onclick={() => (showDeskForm = !showDeskForm)}
				class="text-[10px] px-2 py-0.5 rounded bg-phase-anp/10 text-phase-anp
					hover:bg-phase-anp/20 transition-colors"
			>
				+ Plan Desk
			</button>
		</div>

		{#if showDeskForm}
			<div class="flex gap-2 items-end mb-4 p-3 rounded bg-surface-700/30">
				<div class="flex-1">
					<label for="desk-name" class="text-[10px] text-surface-400 block mb-1"
						>Desk Name</label
					>
					<input
						id="desk-name"
						bind:value={deskName}
						placeholder="e.g., register_user"
						class="w-full bg-surface-700 border border-surface-600 rounded
							px-2.5 py-1.5 text-xs text-surface-100 placeholder-surface-400
							focus:outline-none focus:border-phase-anp/50"
					/>
				</div>
				<div class="flex-1">
					<label for="desk-desc" class="text-[10px] text-surface-400 block mb-1"
						>Description</label
					>
					<input
						id="desk-desc"
						bind:value={deskDesc}
						placeholder="Brief purpose of this desk"
						class="w-full bg-surface-700 border border-surface-600 rounded
							px-2.5 py-1.5 text-xs text-surface-100 placeholder-surface-400
							focus:outline-none focus:border-phase-anp/50"
					/>
				</div>
				<div>
					<label for="desk-dept" class="text-[10px] text-surface-400 block mb-1"
						>Dept</label
					>
					<select
						id="desk-dept"
						bind:value={deskDept}
						class="bg-surface-700 border border-surface-600 rounded
							px-2 py-1.5 text-xs text-surface-100
							focus:outline-none focus:border-phase-anp/50 cursor-pointer"
					>
						<option value="cmd">CMD</option>
						<option value="qry">QRY</option>
						<option value="prj">PRJ</option>
					</select>
				</div>
				<button
					onclick={handlePlanDesk}
					disabled={!deskName.trim() || $isLoading}
					class="px-3 py-1.5 rounded text-xs bg-phase-anp/20 text-phase-anp
						hover:bg-phase-anp/30 transition-colors disabled:opacity-50"
				>
					Plan
				</button>
				<button
					onclick={() => (showDeskForm = false)}
					class="px-3 py-1.5 rounded text-xs text-surface-400 hover:text-surface-100"
				>
					Cancel
				</button>
			</div>
		{/if}

		<p class="text-[10px] text-surface-400">
			Desks are individual capabilities within a department. Each desk owns a
			vertical slice: command + event + handler + projection.
		</p>
	</div>

	<!-- Planning Tasks -->
	<div>
		<h4 class="text-xs font-semibold text-surface-100 mb-3">Planning Tasks</h4>
		<div class="grid grid-cols-1 md:grid-cols-2 gap-3">
			<TaskCard
				title="Desk Inventory"
				description="Create a complete inventory of desks needed for this division, organized by department (CMD, QRY, PRJ)"
				icon={'\u{25A3}'}
				aiContext={`Help me create a desk inventory for the "${$selectedDivision?.context_name}" division. Each desk is a vertical slice (command + event + handler). Organize by CMD (write), QRY (read), and PRJ (projection) departments.`}
			/>
			<TaskCard
				title="Dependency Mapping"
				description="Map dependencies between desks to determine implementation order"
				icon={'\u{21C4}'}
				aiContext={`Help me map dependencies between desks in the "${$selectedDivision?.context_name}" division. Which desks depend on which? What's the optimal implementation order?`}
			/>
			<TaskCard
				title="Sprint Sequencing"
				description="Prioritize and sequence desks into implementation sprints"
				icon={'\u{2630}'}
				aiContext={`Help me sequence the implementation of desks in the "${$selectedDivision?.context_name}" division into logical sprints. Consider dependencies, walking skeleton principles, and the "initiate + archive" first rule.`}
			/>
			<TaskCard
				title="API Design"
				description="Design REST API endpoints for each desk's capabilities"
				icon={'\u{2194}'}
				aiContext={`Help me design REST API endpoints for the "${$selectedDivision?.context_name}" division. Follow the pattern: POST /api/{resource}/{action} for commands, GET /api/{resource} for queries.`}
			/>
		</div>
	</div>
</div>
