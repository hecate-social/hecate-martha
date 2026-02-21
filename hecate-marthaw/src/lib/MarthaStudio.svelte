<svelte:options customElement={{ tag: "martha-studio", shadow: "none" }} />

<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type { PluginApi, HealthData, Venture } from './types.js';
	import { VL_ARCHIVED, VL_DISCOVERING, VL_DISCOVERY_PAUSED, hasFlag } from './types.js';
	import { setApi } from './shared/api.js';
	import { fetchModels } from './shared/context.js';
	import { availableModels } from './shared/aiStore.js';

	// --- Vertical slice stores ---
	import {
		activeVenture,
		ventures,
		divisions,
		selectedDivision,
		isLoading,
		ventureError,
		ventureStep,
		fetchActiveVenture,
		fetchVentures,
		selectVenture,
		initiateVenture
	} from './guide_venture/guide_venture.js';
	import { selectedPhase } from './shared/phaseStore.js';
	import { showAIAssist, openAIAssist, aiModel, setAIModelOverride } from './shared/aiStore.js';
	import {
		showEventStream,
		bigPicturePhase
	} from './storm_venture_big_picture/storm_venture_big_picture.js';

	// --- Vertical slice components ---
	import VentureHeader from './guide_venture/VentureHeader.svelte';
	import VentureSummary from './guide_venture/VentureSummary.svelte';
	import DivisionNav from './guide_venture/DivisionNav.svelte';
	import VisionOracle from './compose_vision/VisionOracle.svelte';
	import StormVentureBigPicture from './storm_venture_big_picture/StormVentureBigPicture.svelte';
	import DesignDivision from './design_division/DesignDivision.svelte';
	import PlanDivision from './plan_division/PlanDivision.svelte';
	import CraftDivision from './craft_division/CraftDivision.svelte';
	import DeployDivision from './deploy_division/DeployDivision.svelte';
	import PhaseProgress from './shared/PhaseProgress.svelte';
	import EventStreamViewer from './shared/EventStreamViewer.svelte';
	import AIAssistPanel from './shared/AIAssistPanel.svelte';
	import ModelSelector from './shared/ModelSelector.svelte';

	// --- Plugin infrastructure (preserved) ---
	let { api }: { api: PluginApi } = $props();

	let health: HealthData | null = $state(null);
	let connectionStatus: 'connected' | 'connecting' | 'disconnected' = $state('connecting');
	let pollTimer: ReturnType<typeof setInterval> | undefined;

	// --- Venture Browser state ---
	let ventureName = $state('');
	let ventureBrief = $state('');
	let browserSearch = $state('');
	let showNewVentureForm = $state(false);
	let showArchived = $state(false);

	// --- Phase grouping for Venture Browser ---
	type PhaseGroup = { label: string; ventures: Venture[] };

	function groupVenturesByPhase(allVentures: Venture[], search: string): PhaseGroup[] {
		let filtered = allVentures;
		if (search.trim()) {
			const q = search.toLowerCase();
			filtered = allVentures.filter(
				(v) =>
					v.name.toLowerCase().includes(q) ||
					(v.brief && v.brief.toLowerCase().includes(q))
			);
		}

		const setup: Venture[] = [];
		const discovery: Venture[] = [];
		const building: Venture[] = [];
		const archived: Venture[] = [];

		for (const v of filtered) {
			if (hasFlag(v.status, VL_ARCHIVED)) {
				archived.push(v);
			} else if (hasFlag(v.status, VL_DISCOVERING) || hasFlag(v.status, VL_DISCOVERY_PAUSED)) {
				discovery.push(v);
			} else if (
				v.phase === 'initiated' ||
				v.phase === 'vision_refined' ||
				v.phase === 'vision_submitted'
			) {
				setup.push(v);
			} else if (v.phase === 'discovery_completed' || v.phase === 'designing' || v.phase === 'planning' || v.phase === 'crafting' || v.phase === 'deploying') {
				building.push(v);
			} else {
				// Default: setup
				setup.push(v);
			}
		}

		const groups: PhaseGroup[] = [];
		if (setup.length > 0) groups.push({ label: 'Setup', ventures: setup });
		if (discovery.length > 0) groups.push({ label: 'Discovery', ventures: discovery });
		if (building.length > 0) groups.push({ label: 'Building', ventures: building });
		// Archived always last, collapsed by default
		if (archived.length > 0) groups.push({ label: 'Archived', ventures: archived });
		return groups;
	}

	// --- Recently updated (top 5) ---
	function recentVentures(allVentures: Venture[]): Venture[] {
		return allVentures
			.filter((v) => !hasFlag(v.status, VL_ARCHIVED))
			.sort((a, b) => (b.updated_at ?? '').localeCompare(a.updated_at ?? ''))
			.slice(0, 5);
	}

	async function fetchHealth() {
		try {
			health = await api.get<HealthData>('/health');
			connectionStatus = 'connected';
		} catch {
			health = null;
			connectionStatus = 'disconnected';
		}
	}

	onMount(async () => {
		setApi(api);
		fetchHealth();
		pollTimer = setInterval(fetchHealth, 5000);
		fetchActiveVenture();
		fetchVentures();
		// Load LLM models from hecate-daemon
		const models = await fetchModels();
		availableModels.set(models);
	});

	onDestroy(() => {
		if (pollTimer) clearInterval(pollTimer);
	});

	async function handleInitiate() {
		if (!ventureName.trim()) return;
		const result = await initiateVenture(
			ventureName.trim(),
			ventureBrief.trim() || ''
		);
		if (result) {
			ventureName = '';
			ventureBrief = '';
			showNewVentureForm = false;
		}
	}
</script>

<div class="flex flex-col h-full">
	{#if $isLoading && !$activeVenture}
		<!-- State 1: Loading -->
		<div class="flex items-center justify-center h-full">
			<div class="text-center text-surface-400">
				<div class="text-2xl mb-2 animate-pulse">{'\u{25C6}'}</div>
				<div class="text-sm">Loading venture...</div>
			</div>
		</div>
	{:else if !$activeVenture}
		<!-- State 2: Venture Browser -->
		<div class="flex flex-col h-full overflow-hidden">
			<!-- Browser header -->
			<div class="border-b border-surface-600 bg-surface-800/50 px-4 py-3 shrink-0">
				<div class="flex items-center gap-3">
					<span class="text-hecate-400 text-lg">{'\u{25C6}'}</span>
					<h1 class="text-sm font-semibold text-surface-100">Martha Studio</h1>

					<!-- Connection status -->
					<div class="flex items-center gap-1.5 text-[10px]">
						<span
							class="inline-block w-1.5 h-1.5 rounded-full {connectionStatus === 'connected'
								? 'bg-success-400'
								: connectionStatus === 'connecting'
									? 'bg-yellow-400 animate-pulse'
									: 'bg-danger-400'}"
						></span>
						<span class="text-surface-500">
							{connectionStatus === 'connected'
								? `v${health?.version ?? '?'}`
								: connectionStatus}
						</span>
					</div>

					<!-- Model selector -->
					<ModelSelector
						currentModel={$aiModel}
						onSelect={(name) => setAIModelOverride(name)}
					/>

					<div class="flex-1"></div>

					<!-- Search -->
					<input
						bind:value={browserSearch}
						placeholder="Search ventures..."
						class="w-48 bg-surface-700 border border-surface-600 rounded-lg
							px-3 py-1.5 text-xs text-surface-100 placeholder-surface-500
							focus:outline-none focus:border-hecate-500"
					/>

					<!-- New Venture toggle -->
					<button
						onclick={() => (showNewVentureForm = !showNewVentureForm)}
						class="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
							{showNewVentureForm
							? 'bg-surface-600 text-surface-300'
							: 'bg-hecate-600 text-surface-50 hover:bg-hecate-500'}"
					>
						{showNewVentureForm ? 'Cancel' : '+ New Venture'}
					</button>
				</div>
			</div>

			<!-- Browser content -->
			<div class="flex-1 overflow-y-auto p-4 space-y-6">
				<!-- Inline new venture form (expandable) -->
				{#if showNewVentureForm}
					<div class="rounded-xl border border-hecate-600/30 bg-surface-800/80 p-5 space-y-4">
						<h3 class="text-xs font-medium text-hecate-300 uppercase tracking-wider">
							New Venture
						</h3>
						<div class="grid grid-cols-[1fr_2fr] gap-4">
							<div>
								<label for="venture-name" class="text-[11px] text-surface-300 block mb-1.5">
									Name
								</label>
								<input
									id="venture-name"
									bind:value={ventureName}
									placeholder="e.g., my-saas-app"
									class="w-full bg-surface-700 border border-surface-600 rounded-lg
										px-3 py-2 text-sm text-surface-100 placeholder-surface-500
										focus:outline-none focus:border-hecate-500"
								/>
							</div>
							<div>
								<label for="venture-brief" class="text-[11px] text-surface-300 block mb-1.5">
									Brief (optional)
								</label>
								<input
									id="venture-brief"
									bind:value={ventureBrief}
									placeholder="What does this venture aim to achieve?"
									class="w-full bg-surface-700 border border-surface-600 rounded-lg
										px-3 py-2 text-sm text-surface-100 placeholder-surface-500
										focus:outline-none focus:border-hecate-500"
								/>
							</div>
						</div>

						{#if $ventureError}
							<div class="text-[11px] text-health-err bg-health-err/10 rounded px-3 py-2">
								{$ventureError}
							</div>
						{/if}

						<div class="flex gap-3">
							<button
								onclick={handleInitiate}
								disabled={!ventureName.trim() || $isLoading}
								class="px-4 py-2 rounded-lg text-xs font-medium transition-colors
									{!ventureName.trim() || $isLoading
									? 'bg-surface-600 text-surface-400 cursor-not-allowed'
									: 'bg-hecate-600 text-surface-50 hover:bg-hecate-500'}"
							>
								{$isLoading ? 'Initiating...' : 'Initiate Venture'}
							</button>
							<button
								onclick={() =>
									openAIAssist(
										'Help me define a new venture. What should I consider? Ask me about the problem domain, target users, and core functionality.'
									)}
								class="px-4 py-2 rounded-lg text-xs text-hecate-400 border border-hecate-600/30
									hover:bg-hecate-600/10 transition-colors"
							>
								{'\u{2726}'} AI Help
							</button>
						</div>
					</div>
				{/if}

				<!-- Empty state -->
				{#if $ventures.length === 0 && !showNewVentureForm}
					<div class="flex flex-col items-center justify-center py-20 text-center">
						<div class="text-4xl mb-4 text-hecate-400">{'\u{25C6}'}</div>
						<h2 class="text-lg font-semibold text-surface-100 mb-2">No Ventures Yet</h2>
						<p class="text-xs text-surface-400 leading-relaxed max-w-sm mb-6">
							A venture is the umbrella for your software endeavor. It houses
							divisions (bounded contexts) and guides them through the development
							lifecycle.
						</p>
						<button
							onclick={() => (showNewVentureForm = true)}
							class="px-5 py-2.5 rounded-lg text-sm font-medium bg-hecate-600 text-surface-50
								hover:bg-hecate-500 transition-colors"
						>
							+ Create Your First Venture
						</button>
					</div>
				{:else}
					<!-- Recent ventures (top 5 by updated_at, only when not searching) -->
					{#if !browserSearch.trim() && $ventures.filter((v) => !hasFlag(v.status, VL_ARCHIVED)).length > 3}
						{@const recent = recentVentures($ventures)}
						{#if recent.length > 0}
							<div>
								<h3 class="text-[11px] text-surface-400 uppercase tracking-wider mb-3">
									Recently Updated
								</h3>
								<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
									{#each recent as v}
										<button
											onclick={() => selectVenture(v)}
											class="group text-left p-4 rounded-xl bg-surface-800/80 border border-surface-600
												hover:border-hecate-500 hover:bg-hecate-600/5 transition-all"
										>
											<div class="flex items-center gap-2">
												<span class="text-hecate-400 group-hover:text-hecate-300">{'\u{25C6}'}</span>
												<span class="font-medium text-sm text-surface-100 truncate">{v.name}</span>
												<span class="text-[10px] px-1.5 py-0.5 rounded-full bg-surface-700 text-surface-300 border border-surface-600 shrink-0">
													{v.status_label ?? v.phase}
												</span>
											</div>
											{#if v.brief}
												<div class="text-[11px] text-surface-400 truncate mt-1.5 ml-5">
													{v.brief}
												</div>
											{/if}
										</button>
									{/each}
								</div>
							</div>
						{/if}
					{/if}

					<!-- Phase-grouped ventures -->
					{@const groups = groupVenturesByPhase($ventures, browserSearch)}
					{#each groups as group}
						{#if group.label === 'Archived'}
							<!-- Archived: collapsed by default -->
							<div>
								<button
									onclick={() => (showArchived = !showArchived)}
									class="flex items-center gap-2 text-[11px] text-surface-500 uppercase tracking-wider
										hover:text-surface-300 transition-colors mb-3"
								>
									<span class="text-[9px]">{showArchived ? '\u{25BC}' : '\u{25B6}'}</span>
									{group.label}
									<span class="text-surface-600">({group.ventures.length})</span>
								</button>
								{#if showArchived}
									<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
										{#each group.ventures as v}
											<button
												onclick={() => selectVenture(v)}
												class="group text-left p-4 rounded-xl bg-surface-800/40 border border-surface-700
													hover:border-surface-500 transition-all opacity-60 hover:opacity-80"
											>
												<div class="flex items-center gap-2">
													<span class="text-surface-500">{'\u{25C6}'}</span>
													<span class="font-medium text-sm text-surface-300 truncate">{v.name}</span>
													<span class="text-[10px] px-1.5 py-0.5 rounded-full bg-surface-700 text-surface-400 border border-surface-600 shrink-0">
														Archived
													</span>
												</div>
												{#if v.brief}
													<div class="text-[11px] text-surface-500 truncate mt-1.5 ml-5">
														{v.brief}
													</div>
												{/if}
											</button>
										{/each}
									</div>
								{/if}
							</div>
						{:else}
							<div>
								<h3 class="text-[11px] text-surface-400 uppercase tracking-wider mb-3">
									{group.label}
								</h3>
								<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
									{#each group.ventures as v}
										<button
											onclick={() => selectVenture(v)}
											class="group text-left p-4 rounded-xl bg-surface-800/80 border border-surface-600
												hover:border-hecate-500 hover:bg-hecate-600/5 transition-all"
										>
											<div class="flex items-center gap-2">
												<span class="text-hecate-400 group-hover:text-hecate-300">{'\u{25C6}'}</span>
												<span class="font-medium text-sm text-surface-100 truncate">{v.name}</span>
												<span class="text-[10px] px-1.5 py-0.5 rounded-full bg-surface-700 text-surface-300 border border-surface-600 shrink-0">
													{v.status_label ?? v.phase}
												</span>
											</div>
											{#if v.brief}
												<div class="text-[11px] text-surface-400 truncate mt-1.5 ml-5">
													{v.brief}
												</div>
											{/if}
										</button>
									{/each}
								</div>
							</div>
						{/if}
					{/each}

					<!-- No results for search -->
					{#if groups.length === 0 && browserSearch.trim()}
						<div class="text-center py-12 text-surface-400 text-sm">
							No ventures matching "{browserSearch}"
						</div>
					{/if}
				{/if}
			</div>
		</div>

		<!-- AI Assist panel even when no venture -->
		{#if $showAIAssist}
			<div class="absolute top-0 right-0 bottom-0 z-10">
				<AIAssistPanel />
			</div>
		{/if}
	{:else}
		<!-- State 3: Active venture -->
		<VentureHeader />

		<!-- Connection status indicator -->
		<div class="absolute top-2 right-2 flex items-center gap-1.5 text-[10px] z-10">
			<span
				class="inline-block w-1.5 h-1.5 rounded-full {connectionStatus === 'connected'
					? 'bg-success-400'
					: connectionStatus === 'connecting'
						? 'bg-yellow-400 animate-pulse'
						: 'bg-danger-400'}"
			></span>
			<span class="text-surface-500">
				{connectionStatus === 'connected'
					? `v${health?.version ?? '?'}`
					: connectionStatus}
			</span>
		</div>

		<div class="flex flex-1 overflow-hidden relative">
			<!-- Left: Division nav -->
			{#if $divisions.length > 0}
				<DivisionNav />
			{/if}

			<!-- Main: Phase content -->
			<div class="flex-1 flex flex-col overflow-hidden">
				{#if $selectedDivision}
					<PhaseProgress />

					<div class="flex-1 overflow-y-auto">
						{#if $selectedPhase === 'dna'}
							<DesignDivision />
						{:else if $selectedPhase === 'anp'}
							<PlanDivision />
						{:else if $selectedPhase === 'tni'}
							<CraftDivision />
						{:else if $selectedPhase === 'dno'}
							<DeployDivision />
						{/if}
					</div>
				{:else if $divisions.length === 0}
					<!-- No divisions: venture step navigation -->
					{#if $ventureStep === 'discovering' || $bigPicturePhase !== 'ready'}
						<div class="flex h-full">
							<div class="flex-1 overflow-hidden">
								<StormVentureBigPicture />
							</div>
							{#if $showEventStream}
								<div class="w-80 border-l border-surface-600 overflow-hidden shrink-0">
									<EventStreamViewer />
								</div>
							{/if}
						</div>
					{:else if $ventureStep === 'initiated' || $ventureStep === 'vision_refined'}
						<VisionOracle />
					{:else if $ventureStep === 'vision_submitted'}
						<VentureSummary nextAction="discovery" />
					{:else if $ventureStep === 'discovery_paused'}
						<div class="flex h-full">
							<div class="flex-1 overflow-hidden">
								<StormVentureBigPicture />
							</div>
							{#if $showEventStream}
								<div class="w-80 border-l border-surface-600 overflow-hidden shrink-0">
									<EventStreamViewer />
								</div>
							{/if}
						</div>
					{:else if $ventureStep === 'discovery_completed'}
						<VentureSummary nextAction="identify" />
					{:else}
						<VentureSummary nextAction="discovery" />
					{/if}
				{:else}
					<div class="flex items-center justify-center h-full text-surface-400 text-sm">
						Select a division from the sidebar
					</div>
				{/if}
			</div>

			<!-- Right: AI Assist panel -->
			{#if $showAIAssist}
				<AIAssistPanel />
			{/if}
		</div>
	{/if}
</div>
