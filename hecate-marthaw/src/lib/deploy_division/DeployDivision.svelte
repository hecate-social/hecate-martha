<script lang="ts">
	import { selectedDivision, isLoading } from '$lib/guide_venture/guide_venture.js';
	import { deployRelease, raiseIncident } from '$lib/deploy_division/deploy_division.js';
	import TaskCard from '$lib/shared/TaskCard.svelte';

	let showDeployForm = $state(false);
	let showIncidentForm = $state(false);
	let releaseVersion = $state('');
	let incidentTitle = $state('');
	let incidentSeverity = $state('medium');
	let incidentDesc = $state('');

	async function handleDeploy() {
		if (!$selectedDivision || !releaseVersion.trim()) return;
		const ok = await deployRelease(
			$selectedDivision.division_id,
			releaseVersion.trim()
		);
		if (ok) {
			releaseVersion = '';
			showDeployForm = false;
		}
	}

	async function handleRaiseIncident() {
		if (!$selectedDivision || !incidentTitle.trim()) return;
		const ok = await raiseIncident($selectedDivision.division_id, {
			incident_title: incidentTitle.trim(),
			severity: incidentSeverity,
			description: incidentDesc.trim() || undefined
		});
		if (ok) {
			incidentTitle = '';
			incidentDesc = '';
			showIncidentForm = false;
		}
	}
</script>

<div class="p-4 space-y-6">
	<div>
		<h3 class="text-sm font-semibold text-surface-100">
			Deployment & Operations
		</h3>
		<p class="text-[11px] text-surface-400 mt-0.5">
			Deploy releases, monitor health, and handle incidents for
			<span class="text-surface-200">{$selectedDivision?.context_name}</span>
		</p>
	</div>

	<!-- Deployment -->
	<div class="rounded-lg border border-surface-600 bg-surface-800/50 p-4">
		<div class="flex items-center justify-between mb-3">
			<h4 class="text-xs font-semibold text-surface-100">Releases</h4>
			<button
				onclick={() => (showDeployForm = !showDeployForm)}
				class="text-[10px] px-2 py-0.5 rounded bg-phase-dno/10 text-phase-dno
					hover:bg-phase-dno/20 transition-colors"
			>
				+ Deploy Release
			</button>
		</div>

		{#if showDeployForm}
			<div class="flex gap-2 items-end mb-4 p-3 rounded bg-surface-700/30">
				<div class="flex-1">
					<label for="rel-version" class="text-[10px] text-surface-400 block mb-1"
						>Version</label
					>
					<input
						id="rel-version"
						bind:value={releaseVersion}
						placeholder="e.g., 0.1.0"
						class="w-full bg-surface-700 border border-surface-600 rounded
							px-2.5 py-1.5 text-xs text-surface-100 placeholder-surface-400
							focus:outline-none focus:border-phase-dno/50"
					/>
				</div>
				<button
					onclick={handleDeploy}
					disabled={!releaseVersion.trim() || $isLoading}
					class="px-3 py-1.5 rounded text-xs bg-phase-dno/20 text-phase-dno
						hover:bg-phase-dno/30 transition-colors disabled:opacity-50"
				>
					Deploy
				</button>
				<button
					onclick={() => (showDeployForm = false)}
					class="px-3 py-1.5 rounded text-xs text-surface-400 hover:text-surface-100"
				>
					Cancel
				</button>
			</div>
		{/if}

		<p class="text-[10px] text-surface-400">
			Deploy through GitOps: version bump, git tag, CI/CD builds, Flux
			reconciles.
		</p>
	</div>

	<!-- Incident Management -->
	<div class="rounded-lg border border-surface-600 bg-surface-800/50 p-4">
		<div class="flex items-center justify-between mb-3">
			<h4 class="text-xs font-semibold text-surface-100">Incidents</h4>
			<button
				onclick={() => (showIncidentForm = !showIncidentForm)}
				class="text-[10px] px-2 py-0.5 rounded bg-health-err/10 text-health-err
					hover:bg-health-err/20 transition-colors"
			>
				+ Raise Incident
			</button>
		</div>

		{#if showIncidentForm}
			<div class="flex gap-2 items-end mb-4 p-3 rounded bg-surface-700/30">
				<div class="flex-1">
					<label for="inc-title" class="text-[10px] text-surface-400 block mb-1"
						>Title</label
					>
					<input
						id="inc-title"
						bind:value={incidentTitle}
						placeholder="Brief description of the incident"
						class="w-full bg-surface-700 border border-surface-600 rounded
							px-2.5 py-1.5 text-xs text-surface-100 placeholder-surface-400
							focus:outline-none focus:border-health-err/50"
					/>
				</div>
				<div>
					<label for="inc-severity" class="text-[10px] text-surface-400 block mb-1"
						>Severity</label
					>
					<select
						id="inc-severity"
						bind:value={incidentSeverity}
						class="bg-surface-700 border border-surface-600 rounded
							px-2 py-1.5 text-xs text-surface-100
							focus:outline-none cursor-pointer"
					>
						<option value="critical">Critical</option>
						<option value="high">High</option>
						<option value="medium">Medium</option>
						<option value="low">Low</option>
					</select>
				</div>
				<div class="flex-1">
					<label for="inc-desc" class="text-[10px] text-surface-400 block mb-1"
						>Description</label
					>
					<input
						id="inc-desc"
						bind:value={incidentDesc}
						placeholder="Details about what happened"
						class="w-full bg-surface-700 border border-surface-600 rounded
							px-2.5 py-1.5 text-xs text-surface-100 placeholder-surface-400
							focus:outline-none focus:border-health-err/50"
					/>
				</div>
				<button
					onclick={handleRaiseIncident}
					disabled={!incidentTitle.trim() || $isLoading}
					class="px-3 py-1.5 rounded text-xs bg-health-err/10 text-health-err
						hover:bg-health-err/20 transition-colors disabled:opacity-50"
				>
					Raise
				</button>
				<button
					onclick={() => (showIncidentForm = false)}
					class="px-3 py-1.5 rounded text-xs text-surface-400 hover:text-surface-100"
				>
					Cancel
				</button>
			</div>
		{/if}
	</div>

	<!-- DnO Tasks -->
	<div>
		<h4 class="text-xs font-semibold text-surface-100 mb-3">
			Operations Tasks
		</h4>
		<div class="grid grid-cols-1 md:grid-cols-2 gap-3">
			<TaskCard
				title="Release Management"
				description="Prepare release: version bump, changelog, git tag, push for CI/CD"
				icon={'\u{1F680}'}
				aiContext={`Help me prepare a release for the "${$selectedDivision?.context_name}" division. Walk me through the GitOps flow: version bump, CHANGELOG update, git tag, and CI/CD pipeline.`}
			/>
			<TaskCard
				title="Staged Rollout"
				description="Plan a staged rollout with canary deployment and health gates"
				icon={'\u{25A4}'}
				aiContext={`Help me plan a staged rollout for the "${$selectedDivision?.context_name}" division. How should we structure canary deployments with health gates on the beam cluster?`}
			/>
			<TaskCard
				title="Health Monitoring"
				description="Configure health checks and SLA thresholds"
				icon={'\u{2665}'}
				aiContext={`Help me set up health monitoring for the "${$selectedDivision?.context_name}" division. What health checks should we configure? What SLA thresholds make sense?`}
			/>
			<TaskCard
				title="Incident Response"
				description="Diagnose issues, determine root cause, plan and execute fixes"
				icon={'\u{26A0}'}
				aiContext={`Help me diagnose an incident in the "${$selectedDivision?.context_name}" division. What diagnostic steps should I follow? How do I determine root cause and plan a fix?`}
			/>
			<TaskCard
				title="Rescue Escalation"
				description="When monitoring detects critical issues, escalate back to design if needed"
				icon={'\u{21BA}'}
				aiContext={`A critical issue in the "${$selectedDivision?.context_name}" division may require a design change. Help me determine if this is a bug fix (stay in DnO) or a design flaw (escalate back to DnA). The lifecycle is circular: rescue can escalate to design.`}
			/>
			<TaskCard
				title="Observability"
				description="Set up logging, metrics, and tracing for production visibility"
				icon={'\u{25CE}'}
				aiContext={`Help me set up observability for the "${$selectedDivision?.context_name}" division. What should we log? What metrics should we track? How do we set up distributed tracing on the beam cluster?`}
			/>
		</div>
	</div>
</div>
