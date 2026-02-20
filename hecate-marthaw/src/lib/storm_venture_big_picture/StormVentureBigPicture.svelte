<script lang="ts">
	import { activeVenture } from '$lib/guide_venture/guide_venture.js';
	import {
		bigPicturePhase,
		bigPictureEvents,
		eventClusters,
		factArrows,
		highOctaneRemaining,
		unclusteredEvents,
		bigPictureEventCount,
		stickyStacks,
		showEventStream,
		startBigPictureStorm,
		postEventSticky,
		pullEventSticky,
		stackEventSticky,
		unstackEventSticky,
		groomEventStack,
		clusterEventSticky,
		unclusterEventSticky,
		dissolveEventCluster,
		nameEventCluster,
		drawFactArrow,
		eraseFactArrow,
		advanceStormPhase,
		promoteAllClusters,
		shelveStorm,
		resumeStorm,
		resetBigPicture,
		fetchStormState,
		isLoading,
		type BigPictureEvent,
		type EventCluster
	} from '$lib/storm_venture_big_picture/storm_venture_big_picture.js';
	import { bigPictureAgents } from '$lib/shared/agentsStore.js';
	import { openAIAssist } from '$lib/shared/aiStore.js';

	let eventInput = $state('');
	let renamingCluster = $state<string | null>(null);
	let renameInput = $state('');

	// Fact mapping state
	let factFrom = $state<string | null>(null);
	let factTo = $state<string | null>(null);
	let factName = $state('');

	// Drag state
	let draggingEvent = $state<string | null>(null);

	// Groom: selected canonical sticky per stack
	let groomSelections = $state<Record<string, string>>({});

	function vid(): string {
		return $activeVenture?.venture_id ?? '';
	}

	function formatTime(seconds: number): string {
		const m = Math.floor(seconds / 60);
		const s = seconds % 60;
		return `${m}:${s.toString().padStart(2, '0')}`;
	}

	async function handleEventKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey && eventInput.trim()) {
			e.preventDefault();
			await postEventSticky(vid(), eventInput);
			eventInput = '';
		}
	}

	async function handleRenameKeydown(e: KeyboardEvent, clusterId: string) {
		if (e.key === 'Enter' && renameInput.trim()) {
			await nameEventCluster(vid(), clusterId, renameInput.trim());
			renamingCluster = null;
			renameInput = '';
		} else if (e.key === 'Escape') {
			renamingCluster = null;
		}
	}

	function startRename(cluster: EventCluster) {
		renamingCluster = cluster.cluster_id;
		renameInput = cluster.name ?? '';
	}

	async function handleAddFact() {
		if (factFrom && factTo && factFrom !== factTo && factName.trim()) {
			await drawFactArrow(vid(), factFrom, factTo, factName.trim());
			factName = '';
		}
	}

	async function handlePromote() {
		await promoteAllClusters(vid());
	}

	function clusterStickies(clusterId: string): BigPictureEvent[] {
		return $bigPictureEvents.filter((e) => e.cluster_id === clusterId);
	}

	// Stickies not in any stack (for stack phase left panel, groom standalone)
	let freeStickies = $derived($bigPictureEvents.filter((e) => !e.stack_id));

	function buildAgentContext(agentPrompt: string): string {
		const venture = $activeVenture;
		const events = $bigPictureEvents;
		const clusters = $eventClusters;
		const arrows = $factArrows;

		let ctx = agentPrompt + '\n\n---\n\n';

		if (venture) {
			ctx += `Venture: "${venture.name}"`;
			if (venture.brief) ctx += ` \u2014 ${venture.brief}`;
			ctx += '\n\n';
		}

		if (events.length > 0) {
			ctx += 'Events on the board:\n';
			ctx += events
				.map((e) => `- ${e.text}${e.weight > 1 ? ` (x${e.weight})` : ''}`)
				.join('\n');
			ctx += '\n\n';
		}

		if (clusters.length > 0) {
			ctx += 'Current clusters (candidate divisions):\n';
			for (const c of clusters) {
				const cEvents = events.filter((e) => e.cluster_id === c.cluster_id);
				ctx += `- ${c.name ?? '(unnamed)'}: ${cEvents.map((e) => e.text).join(', ') || '(empty)'}\n`;
			}
			ctx += '\n';
		}

		if (arrows.length > 0) {
			ctx += 'Integration fact arrows:\n';
			for (const a of arrows) {
				const from = clusters.find((c) => c.cluster_id === a.from_cluster)?.name ?? '?';
				const to = clusters.find((c) => c.cluster_id === a.to_cluster)?.name ?? '?';
				ctx += `- ${from} \u2192 ${a.fact_name} \u2192 ${to}\n`;
			}
		}

		return ctx;
	}

	// Phase progression labels
	const PHASE_STEPS = [
		{ phase: 'storm', label: 'Storm', icon: '\u{26A1}' },
		{ phase: 'stack', label: 'Stack', icon: '\u{2261}' },
		{ phase: 'groom', label: 'Groom', icon: '\u{2702}' },
		{ phase: 'cluster', label: 'Cluster', icon: '\u{2B50}' },
		{ phase: 'name', label: 'Name', icon: '\u{2B21}' },
		{ phase: 'map', label: 'Map', icon: '\u{2192}' },
		{ phase: 'promoted', label: 'Done', icon: '\u{2713}' }
	] as const;

	// Hydrate storm state when venture changes
	$effect(() => {
		const venture = $activeVenture;
		if (venture) {
			fetchStormState(venture.venture_id);
		}
	});
</script>

<div class="flex flex-col h-full">
	<!-- Phase progress bar -->
	<div class="border-b border-surface-600 bg-surface-800/50 px-4 py-2 shrink-0">
		<div class="flex items-center gap-1">
			<span class="text-xs text-surface-400 mr-2">Big Picture</span>
			{#each PHASE_STEPS as step, i}
				{@const isCurrent = $bigPicturePhase === step.phase}
				{@const isPast =
					PHASE_STEPS.findIndex((s) => s.phase === $bigPicturePhase) > i}

				{#if i > 0}
					<div
						class="w-6 h-px {isPast
							? 'bg-hecate-400/60'
							: 'bg-surface-600'}"
					></div>
				{/if}

				<div
					class="flex items-center gap-1 px-2 py-1 rounded text-[10px]
						{isCurrent
						? 'bg-surface-700 border border-hecate-500/40 text-hecate-300'
						: isPast
							? 'text-hecate-400/60'
							: 'text-surface-500'}"
				>
					<span>{step.icon}</span>
					<span>{step.label}</span>
				</div>
			{/each}

			<div class="flex-1"></div>

			{#if $bigPicturePhase !== 'ready' && $bigPicturePhase !== 'promoted' && $bigPicturePhase !== 'shelved'}
				<span class="text-[10px] text-surface-400">
					{$bigPictureEventCount} events
				</span>
			{/if}

			{#if $bigPicturePhase === 'storm'}
				<span
					class="text-sm font-bold tabular-nums ml-2
						{$highOctaneRemaining <= 60
						? 'text-health-err animate-pulse'
						: $highOctaneRemaining <= 180
							? 'text-health-warn'
							: 'text-es-event'}"
				>
					{formatTime($highOctaneRemaining)}
				</span>
			{/if}

			{#if $bigPicturePhase !== 'ready' && $bigPicturePhase !== 'promoted' && $bigPicturePhase !== 'shelved'}
				<button
					onclick={() => showEventStream.update((v) => !v)}
					class="text-[9px] px-2 py-0.5 rounded ml-1
						{$showEventStream
						? 'text-hecate-300 bg-hecate-600/20'
						: 'text-surface-400 hover:text-surface-200 hover:bg-surface-700'} transition-colors"
					title="Toggle event stream viewer"
				>
					Stream
				</button>
				<button
					onclick={() => shelveStorm(vid())}
					class="text-[9px] px-2 py-0.5 rounded ml-1
						text-surface-400 hover:text-health-warn hover:bg-surface-700 transition-colors"
					title="Shelve storm"
				>
					Shelve
				</button>
			{/if}
		</div>
	</div>

	<!-- Main content area -->
	<div class="flex-1 overflow-y-auto">
		<!-- PHASE: READY -->
		{#if $bigPicturePhase === 'ready'}
			<div class="flex items-center justify-center h-full">
				<div class="text-center max-w-lg mx-4">
					<div class="text-4xl mb-4 text-es-event">{'\u{26A1}'}</div>
					<h2 class="text-lg font-semibold text-surface-100 mb-3">
						Big Picture Event Storming
					</h2>
					<p class="text-xs text-surface-400 leading-relaxed mb-6">
						Discover the domain landscape by storming events onto the board.
						Start with a 10-minute high octane phase where everyone
						(including AI agents) throws domain events as fast as possible.
						<br /><br />
						Volume over quality. The thick stacks reveal what matters.
						Natural clusters become your divisions (bounded contexts).
					</p>

					<div class="flex flex-col items-center gap-4">
						<button
							onclick={() => startBigPictureStorm(vid())}
							class="px-6 py-3 rounded-lg text-sm font-medium
								bg-es-event text-surface-50 hover:bg-es-event/90
								transition-colors shadow-lg shadow-es-event/20"
						>
							{'\u{26A1}'} Start High Octane (10 min)
						</button>

						<div class="flex gap-2">
							{#each $bigPictureAgents as agent}
								<button
									onclick={() =>
										openAIAssist(
											buildAgentContext(agent.prompt),
											agent.id
										)}
									class="flex items-center gap-1 text-[10px] px-2 py-1 rounded
										text-surface-400 hover:text-hecate-300
										hover:bg-hecate-600/10 transition-colors"
									title={agent.description}
								>
									<span>{agent.icon}</span>
									<span>{agent.name}</span>
								</button>
							{/each}
						</div>
					</div>
				</div>
			</div>

		<!-- PHASE: STORM (High Octane) -->
		{:else if $bigPicturePhase === 'storm'}
			<div class="flex flex-col h-full">
				<!-- Event stream display -->
				<div class="flex-1 overflow-y-auto p-4">
					<div class="flex flex-wrap gap-2 content-start">
						{#each $bigPictureEvents as evt (evt.sticky_id)}
							<div
								class="group relative px-3 py-2 rounded text-xs
									bg-es-event/15 border border-es-event/30 text-surface-100
									hover:border-es-event/50 transition-colors"
							>
								<span>{evt.text}</span>
								<span class="text-[8px] text-es-event/60 ml-1.5">
									{evt.author === 'user' ? '' : evt.author}
								</span>
								<button
									onclick={() => pullEventSticky(vid(), evt.sticky_id)}
									class="absolute -top-1 -right-1 w-4 h-4 rounded-full
										bg-surface-700 border border-surface-600
										text-surface-400 hover:text-health-err
										text-[8px] flex items-center justify-center
										opacity-0 group-hover:opacity-100 transition-opacity"
								>
									{'\u{2715}'}
								</button>
							</div>
						{/each}

						{#if $bigPictureEvents.length === 0}
							<div class="text-surface-500 text-xs italic">
								Start throwing events! Type below or ask an AI agent...
							</div>
						{/if}
					</div>
				</div>

				<!-- Input + controls -->
				<div class="border-t border-surface-600 p-3 shrink-0">
					<div class="flex gap-2 mb-2">
						<input
							bind:value={eventInput}
							onkeydown={handleEventKeydown}
							placeholder="Type a domain event (past tense)... e.g., order_placed"
							class="flex-1 bg-surface-700 border border-es-event/30 rounded px-3 py-2
								text-xs text-surface-100 placeholder-surface-400
								focus:outline-none focus:border-es-event"
						/>
						<button
							onclick={async () => {
								if (eventInput.trim()) {
									await postEventSticky(vid(), eventInput);
									eventInput = '';
								}
							}}
							disabled={!eventInput.trim()}
							class="px-3 py-2 rounded text-xs transition-colors
								{eventInput.trim()
								? 'bg-es-event text-surface-50 hover:bg-es-event/80'
								: 'bg-surface-600 text-surface-400 cursor-not-allowed'}"
						>
							Add
						</button>
					</div>

					<div class="flex items-center justify-between">
						<div class="flex gap-1.5">
							{#each $bigPictureAgents as agent}
								<button
									onclick={() =>
										openAIAssist(
											buildAgentContext(agent.prompt),
											agent.id
										)}
									class="flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded
										text-surface-400 hover:text-hecate-300
										hover:bg-hecate-600/10 transition-colors"
									title={agent.description}
								>
									<span>{agent.icon}</span>
									<span>{agent.role}</span>
								</button>
							{/each}
						</div>

						<button
							onclick={() => advanceStormPhase(vid(), 'stack')}
							class="text-[10px] px-3 py-1 rounded
								bg-surface-700 text-surface-300
								hover:text-surface-100 hover:bg-surface-600 transition-colors"
						>
							End Storm {'\u{2192}'} Stack
						</button>
					</div>
				</div>
			</div>

		<!-- PHASE: STACK (group duplicates) -->
		{:else if $bigPicturePhase === 'stack'}
			<div class="flex flex-col h-full">
				<div class="flex-1 overflow-y-auto p-4">
					<p class="text-xs text-surface-400 mb-3">
						Drag duplicate or related stickies onto each other to form stacks.
						Thick stacks reveal what matters most.
					</p>
					<div class="flex gap-4">
						<!-- Unstacked stickies -->
						<div class="w-64 shrink-0">
							<h3 class="text-[10px] font-semibold text-surface-300 mb-2 uppercase tracking-wider">
								Stickies ({freeStickies.length})
							</h3>
							<div
								class="space-y-1 min-h-[200px] rounded-lg border border-dashed border-surface-600 p-2"
							>
								{#each freeStickies as evt (evt.sticky_id)}
									<!-- svelte-ignore a11y_no_static_element_interactions -->
									<div
										draggable="true"
										ondragstart={() => (draggingEvent = evt.sticky_id)}
										ondragend={() => (draggingEvent = null)}
										ondragover={(e) => e.preventDefault()}
										ondrop={() => {
											if (draggingEvent && draggingEvent !== evt.sticky_id) {
												stackEventSticky(vid(), draggingEvent, evt.sticky_id);
												draggingEvent = null;
											}
										}}
										class="group flex items-center gap-1.5 px-2 py-1.5 rounded text-[11px]
											bg-es-event/15 border border-es-event/30 text-surface-100
											cursor-grab active:cursor-grabbing hover:border-es-event/50"
									>
										<span class="flex-1 truncate">{evt.text}</span>
										{#if evt.weight > 1}
											<span class="text-[8px] px-1 rounded bg-es-event/20 text-es-event">
												x{evt.weight}
											</span>
										{/if}
									</div>
								{/each}
							</div>
						</div>

						<!-- Stacks -->
						<div class="flex-1">
							<h3 class="text-[10px] font-semibold text-surface-300 mb-2 uppercase tracking-wider">
								Stacks ({$stickyStacks.size})
							</h3>
							<div class="grid grid-cols-2 gap-3">
								{#each [...$stickyStacks.entries()] as [stackId, stackEvents] (stackId)}
									<!-- svelte-ignore a11y_no_static_element_interactions -->
									<div
										ondragover={(e) => e.preventDefault()}
										ondrop={() => {
											if (draggingEvent && stackEvents.length > 0) {
												stackEventSticky(vid(), draggingEvent, stackEvents[0].sticky_id);
												draggingEvent = null;
											}
										}}
										class="rounded-lg border-2 p-3 min-h-[80px] transition-colors
											{draggingEvent
											? 'border-dashed border-hecate-500/50 bg-hecate-600/5'
											: 'border-surface-600 bg-surface-800'}"
									>
										<div class="flex items-center gap-2 mb-2">
											<span class="text-[10px] font-bold text-es-event">
												{stackEvents.length}x
											</span>
											<span class="text-[9px] text-surface-500 font-mono">
												{stackId.slice(0, 8)}
											</span>
										</div>
										<div class="space-y-1">
											{#each stackEvents as evt (evt.sticky_id)}
												<div
													class="group flex items-center gap-1 px-2 py-1 rounded text-[10px]
														bg-es-event/10 text-surface-200"
												>
													<span class="flex-1 truncate">{evt.text}</span>
													<button
														onclick={() => unstackEventSticky(vid(), evt.sticky_id)}
														class="text-[8px] text-surface-500 hover:text-surface-300
															opacity-0 group-hover:opacity-100"
														title="Unstack"
													>
														{'\u{21A9}'}
													</button>
												</div>
											{/each}
										</div>
									</div>
								{/each}

								{#if $stickyStacks.size === 0}
									<div
										class="col-span-2 text-center py-8 text-surface-500 text-xs
											border border-dashed border-surface-600 rounded-lg"
									>
										Drag stickies onto each other to create stacks.
									</div>
								{/if}
							</div>
						</div>
					</div>
				</div>

				<!-- Footer controls -->
				<div class="border-t border-surface-600 p-3 shrink-0">
					<div class="flex items-center justify-between">
						<div class="flex gap-1.5">
							{#each $bigPictureAgents.slice(0, 2) as agent}
								<button
									onclick={() =>
										openAIAssist(
											buildAgentContext(agent.prompt),
											agent.id
										)}
									class="flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded
										text-surface-400 hover:text-hecate-300
										hover:bg-hecate-600/10 transition-colors"
								>
									<span>{agent.icon}</span>
									<span>Ask {agent.name}</span>
								</button>
							{/each}
						</div>

						<button
							onclick={() => advanceStormPhase(vid(), 'groom')}
							class="text-[10px] px-3 py-1 rounded transition-colors
								bg-hecate-600/20 text-hecate-300 hover:bg-hecate-600/30"
						>
							Groom Stacks {'\u{2192}'}
						</button>
					</div>
				</div>
			</div>

		<!-- PHASE: GROOM (pick canonical from each stack) -->
		{:else if $bigPicturePhase === 'groom'}
			<div class="flex flex-col h-full">
				<div class="flex-1 overflow-y-auto p-4">
					<div class="max-w-2xl mx-auto">
						<p class="text-xs text-surface-400 mb-4">
							For each stack, select the best representative sticky. The winner
							gets the stack's weight (vote count). Other stickies are absorbed.
						</p>

						{#if $stickyStacks.size > 0}
							<div class="space-y-4 mb-6">
								{#each [...$stickyStacks.entries()] as [stackId, stackEvents] (stackId)}
									{@const selected = groomSelections[stackId]}

									<div class="rounded-lg border border-surface-600 bg-surface-800 p-4">
										<div class="flex items-center gap-2 mb-3">
											<span class="text-xs font-semibold text-surface-200">
												Stack ({stackEvents.length} stickies)
											</span>
											<div class="flex-1"></div>
											<button
												onclick={() => {
													if (selected) {
														groomEventStack(vid(), stackId, selected);
													}
												}}
												disabled={!selected}
												class="text-[10px] px-2 py-1 rounded transition-colors
													{selected
													? 'bg-hecate-600/20 text-hecate-300 hover:bg-hecate-600/30'
													: 'bg-surface-700 text-surface-500 cursor-not-allowed'}"
											>
												Groom {'\u{2702}'}
											</button>
										</div>

										<div class="space-y-1.5">
											{#each stackEvents as evt (evt.sticky_id)}
												<button
													onclick={() =>
														(groomSelections = {
															...groomSelections,
															[stackId]: evt.sticky_id
														})}
													class="w-full text-left flex items-center gap-2 px-3 py-2 rounded text-[11px]
														transition-colors
														{selected === evt.sticky_id
														? 'bg-hecate-600/20 border border-hecate-500/40 text-hecate-200'
														: 'bg-surface-700/50 border border-transparent text-surface-200 hover:border-surface-500'}"
												>
													<span
														class="w-3 h-3 rounded-full border-2 shrink-0
															{selected === evt.sticky_id
															? 'border-hecate-400 bg-hecate-400'
															: 'border-surface-500'}"
													></span>
													<span class="flex-1">{evt.text}</span>
													<span class="text-[8px] text-surface-400">
														{evt.author === 'user' ? '' : evt.author}
													</span>
												</button>
											{/each}
										</div>
									</div>
								{/each}
							</div>
						{:else}
							<div
								class="text-center py-8 text-surface-500 text-xs
									border border-dashed border-surface-600 rounded-lg mb-6"
							>
								No stacks to groom. All stickies are unique.
							</div>
						{/if}

						<!-- Standalone stickies -->
						{#if freeStickies.length > 0}
							<div>
								<h3 class="text-[10px] font-semibold text-surface-300 mb-2 uppercase tracking-wider">
									Standalone Stickies ({freeStickies.length})
								</h3>
								<div class="flex flex-wrap gap-1.5">
									{#each freeStickies as evt (evt.sticky_id)}
										<span
											class="text-[10px] px-2 py-1 rounded
												bg-es-event/10 text-surface-200"
										>
											{evt.text}
											{#if evt.weight > 1}
												<span class="text-[8px] text-es-event ml-1">
													x{evt.weight}
												</span>
											{/if}
										</span>
									{/each}
								</div>
							</div>
						{/if}
					</div>
				</div>

				<div class="border-t border-surface-600 p-3 shrink-0">
					<div class="flex items-center justify-end">
						<button
							onclick={() => advanceStormPhase(vid(), 'cluster')}
							class="text-[10px] px-3 py-1 rounded transition-colors
								bg-hecate-600/20 text-hecate-300 hover:bg-hecate-600/30"
						>
							Cluster Events {'\u{2192}'}
						</button>
					</div>
				</div>
			</div>

		<!-- PHASE: CLUSTER -->
		{:else if $bigPicturePhase === 'cluster'}
			<div class="flex flex-col h-full">
				<div class="flex-1 overflow-y-auto p-4">
					<p class="text-xs text-surface-400 mb-3">
						Drag related stickies onto each other to form clusters.
						Clusters become candidate divisions (bounded contexts).
					</p>
					<div class="flex gap-4">
						<!-- Unclustered events (left) -->
						<div class="w-64 shrink-0">
							<h3 class="text-[10px] font-semibold text-surface-300 mb-2 uppercase tracking-wider">
								Unclustered ({$unclusteredEvents.length})
							</h3>
							<div
								class="space-y-1 min-h-[200px] rounded-lg border border-dashed border-surface-600 p-2"
							>
								{#each $unclusteredEvents as evt (evt.sticky_id)}
									<!-- svelte-ignore a11y_no_static_element_interactions -->
									<div
										draggable="true"
										ondragstart={() => (draggingEvent = evt.sticky_id)}
										ondragend={() => (draggingEvent = null)}
										ondragover={(e) => e.preventDefault()}
										ondrop={() => {
											if (draggingEvent && draggingEvent !== evt.sticky_id) {
												clusterEventSticky(vid(), draggingEvent, evt.sticky_id);
												draggingEvent = null;
											}
										}}
										class="group flex items-center gap-1.5 px-2 py-1.5 rounded text-[11px]
											bg-es-event/15 border border-es-event/30 text-surface-100
											cursor-grab active:cursor-grabbing hover:border-es-event/50"
									>
										<span class="flex-1 truncate">{evt.text}</span>
										{#if evt.weight > 1}
											<span class="text-[8px] px-1 rounded bg-es-event/20 text-es-event">
												x{evt.weight}
											</span>
										{/if}
									</div>
								{/each}

								{#if $unclusteredEvents.length === 0}
									<div class="text-[10px] text-surface-500 text-center py-4 italic">
										All events clustered
									</div>
								{/if}
							</div>
						</div>

						<!-- Clusters (right) -->
						<div class="flex-1">
							<h3 class="text-[10px] font-semibold text-surface-300 mb-2 uppercase tracking-wider">
								Clusters ({$eventClusters.length})
							</h3>

							<div class="grid grid-cols-2 gap-3">
								{#each $eventClusters as cluster (cluster.cluster_id)}
									{@const cEvents = clusterStickies(cluster.cluster_id)}

									<!-- svelte-ignore a11y_no_static_element_interactions -->
									<div
										ondragover={(e) => e.preventDefault()}
										ondrop={() => {
											if (draggingEvent && cEvents.length > 0) {
												clusterEventSticky(vid(), draggingEvent, cEvents[0].sticky_id);
												draggingEvent = null;
											}
										}}
										class="rounded-lg border-2 p-3 min-h-[120px] transition-colors
											{draggingEvent
											? 'border-dashed border-hecate-500/50 bg-hecate-600/5'
											: 'border-surface-600 bg-surface-800'}"
										style="border-color: {draggingEvent ? '' : cluster.color + '40'}"
									>
										<div class="flex items-center gap-2 mb-2">
											<div
												class="w-3 h-3 rounded-sm shrink-0"
												style="background-color: {cluster.color}"
											></div>
											<span class="flex-1 text-xs font-semibold text-surface-100 truncate">
												{cluster.name ?? 'Unnamed'}
											</span>
											<span class="text-[9px] text-surface-400">
												{cEvents.length}
											</span>
											<button
												onclick={() => dissolveEventCluster(vid(), cluster.cluster_id)}
												class="text-[9px] text-surface-500 hover:text-health-err transition-colors"
												title="Dissolve cluster"
											>
												{'\u{2715}'}
											</button>
										</div>

										<div class="space-y-1">
											{#each cEvents as evt (evt.sticky_id)}
												<div
													draggable="true"
													ondragstart={() =>
														(draggingEvent = evt.sticky_id)}
													ondragend={() =>
														(draggingEvent = null)}
													class="group flex items-center gap-1 px-2 py-1 rounded text-[10px]
														bg-es-event/10 text-surface-200
														cursor-grab active:cursor-grabbing"
												>
													<span class="flex-1 truncate"
														>{evt.text}</span
													>
													{#if evt.weight > 1}
														<span class="text-[8px] text-es-event/60">
															x{evt.weight}
														</span>
													{/if}
													<button
														onclick={() =>
															unclusterEventSticky(
																vid(),
																evt.sticky_id
															)}
														class="text-[8px] text-surface-500 hover:text-surface-300
															opacity-0 group-hover:opacity-100"
														title="Remove from cluster"
													>
														{'\u{21A9}'}
													</button>
												</div>
											{/each}
										</div>
									</div>
								{/each}

								{#if $eventClusters.length === 0}
									<div
										class="col-span-2 text-center py-8 text-surface-500 text-xs
											border border-dashed border-surface-600 rounded-lg"
									>
										Drag stickies onto each other to create clusters.
									</div>
								{/if}
							</div>
						</div>
					</div>
				</div>

				<!-- Footer controls -->
				<div class="border-t border-surface-600 p-3 shrink-0">
					<div class="flex items-center justify-between">
						<div class="flex gap-1.5">
							{#each $bigPictureAgents.slice(0, 2) as agent}
								<button
									onclick={() =>
										openAIAssist(
											buildAgentContext(agent.prompt),
											agent.id
										)}
									class="flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded
										text-surface-400 hover:text-hecate-300
										hover:bg-hecate-600/10 transition-colors"
								>
									<span>{agent.icon}</span>
									<span>Ask {agent.name}</span>
								</button>
							{/each}
						</div>

						<button
							onclick={() => advanceStormPhase(vid(), 'name')}
							disabled={$eventClusters.length === 0}
							class="text-[10px] px-3 py-1 rounded transition-colors
								{$eventClusters.length === 0
								? 'bg-surface-700 text-surface-500 cursor-not-allowed'
								: 'bg-hecate-600/20 text-hecate-300 hover:bg-hecate-600/30'}"
						>
							Name Divisions {'\u{2192}'}
						</button>
					</div>
				</div>
			</div>

		<!-- PHASE: NAME (name clusters as divisions) -->
		{:else if $bigPicturePhase === 'name'}
			<div class="flex flex-col h-full">
				<div class="flex-1 overflow-y-auto p-4">
					<div class="max-w-2xl mx-auto">
						<p class="text-xs text-surface-400 mb-4">
							Name each cluster as a bounded context (division). These become
							the divisions in your venture. Use snake_case naming.
						</p>

						<div class="space-y-3">
							{#each $eventClusters as cluster (cluster.cluster_id)}
								{@const cEvents = clusterStickies(cluster.cluster_id)}

								<div
									class="rounded-lg border bg-surface-800 p-4"
									style="border-color: {cluster.color}40"
								>
									<div class="flex items-center gap-3 mb-2">
										<div
											class="w-4 h-4 rounded"
											style="background-color: {cluster.color}"
										></div>

										{#if renamingCluster === cluster.cluster_id}
											<input
												bind:value={renameInput}
												onkeydown={(e) =>
													handleRenameKeydown(e, cluster.cluster_id)}
												onblur={() => (renamingCluster = null)}
												class="flex-1 bg-surface-700 border border-surface-500 rounded px-3 py-1.5
													text-sm text-surface-100 focus:outline-none focus:border-hecate-500"
												placeholder="division_name (snake_case)"
											/>
										{:else}
											<button
												onclick={() => startRename(cluster)}
												class="flex-1 text-left text-sm font-semibold transition-colors
													{cluster.name
													? 'text-surface-100 hover:text-hecate-300'
													: 'text-surface-400 italic hover:text-hecate-300'}"
												title="Click to name"
											>
												{cluster.name ?? 'Click to name...'}
											</button>
										{/if}

										<span class="text-[10px] text-surface-400">
											{cEvents.length} events
										</span>
									</div>

									<div class="flex flex-wrap gap-1.5 ml-7">
										{#each cEvents as evt (evt.sticky_id)}
											<span
												class="text-[9px] px-1.5 py-0.5 rounded
													bg-es-event/10 text-es-event/80"
											>
												{evt.text}
												{#if evt.weight > 1}
													<span class="text-es-event/50">x{evt.weight}</span>
												{/if}
											</span>
										{/each}
									</div>
								</div>
							{/each}
						</div>
					</div>
				</div>

				<div class="border-t border-surface-600 p-3 shrink-0">
					<div class="flex items-center justify-end">
						<button
							onclick={() => advanceStormPhase(vid(), 'map')}
							class="text-[10px] px-3 py-1 rounded
								bg-hecate-600/20 text-hecate-300 hover:bg-hecate-600/30 transition-colors"
						>
							Map Integration Facts {'\u{2192}'}
						</button>
					</div>
				</div>
			</div>

		<!-- PHASE: MAP (context map / fact arrows) -->
		{:else if $bigPicturePhase === 'map'}
			<div class="flex flex-col h-full">
				<div class="flex-1 overflow-y-auto p-4">
					<div class="max-w-3xl mx-auto">
						<p class="text-xs text-surface-400 mb-4">
							Map how divisions communicate. Each arrow represents an
							integration fact that flows from one context to another.
							This is your Context Map.
						</p>

						<!-- Visual context map -->
						<div class="mb-6">
							<div class="flex flex-wrap gap-3 justify-center mb-4">
								{#each $eventClusters as cluster (cluster.cluster_id)}
									<div
										class="px-4 py-2 rounded-lg border-2 text-xs font-semibold text-surface-100"
										style="border-color: {cluster.color}; background-color: {cluster.color}15"
									>
										{cluster.name ?? 'Unnamed'}
										<span class="text-[9px] text-surface-400 ml-1">
											({clusterStickies(cluster.cluster_id).length})
										</span>
									</div>
								{/each}
							</div>

							<!-- Fact arrows list -->
							{#if $factArrows.length > 0}
								<div class="space-y-1.5 mb-4">
									{#each $factArrows as arrow (arrow.arrow_id)}
										{@const from = $eventClusters.find(
											(c) => c.cluster_id === arrow.from_cluster
										)}
										{@const to = $eventClusters.find(
											(c) => c.cluster_id === arrow.to_cluster
										)}

										<div
											class="flex items-center gap-2 px-3 py-1.5 rounded
												bg-surface-800 border border-surface-600 text-xs"
										>
											<span
												class="px-1.5 py-0.5 rounded text-[10px] font-medium"
												style="color: {from?.color ?? '#888'}; background-color: {(from?.color ?? '#888')}15"
											>
												{from?.name ?? '?'}
											</span>
											<span class="text-surface-400">{'\u{2192}'}</span>
											<span class="text-es-event font-mono text-[10px]">
												{arrow.fact_name}
											</span>
											<span class="text-surface-400">{'\u{2192}'}</span>
											<span
												class="px-1.5 py-0.5 rounded text-[10px] font-medium"
												style="color: {to?.color ?? '#888'}; background-color: {(to?.color ?? '#888')}15"
											>
												{to?.name ?? '?'}
											</span>
											<div class="flex-1"></div>
											<button
												onclick={() => eraseFactArrow(vid(), arrow.arrow_id)}
												class="text-surface-500 hover:text-health-err text-[9px] transition-colors"
											>
												{'\u{2715}'}
											</button>
										</div>
									{/each}
								</div>
							{/if}
						</div>

						<!-- Add fact form -->
						{#if $eventClusters.length >= 2}
							<div
								class="rounded-lg border border-surface-600 bg-surface-800 p-4"
							>
								<h4 class="text-[10px] font-semibold text-surface-300 uppercase tracking-wider mb-3">
									Add Integration Fact
								</h4>

								<div class="flex items-end gap-2">
									<div class="flex-1">
										<label class="text-[9px] text-surface-400 block mb-1">
											From (publishes)
										</label>
										<select
											bind:value={factFrom}
											class="w-full bg-surface-700 border border-surface-600 rounded px-2 py-1.5
												text-[10px] text-surface-100 focus:outline-none focus:border-hecate-500"
										>
											<option value={null}>Select...</option>
											{#each $eventClusters as c}
												<option value={c.cluster_id}>{c.name ?? 'Unnamed'}</option>
											{/each}
										</select>
									</div>

									<div class="flex-1">
										<label class="text-[9px] text-surface-400 block mb-1">
											Fact name
										</label>
										<input
											bind:value={factName}
											placeholder="e.g., order_confirmed"
											class="w-full bg-surface-700 border border-surface-600 rounded px-2 py-1.5
												text-[10px] text-surface-100 placeholder-surface-400
												focus:outline-none focus:border-hecate-500"
										/>
									</div>

									<div class="flex-1">
										<label class="text-[9px] text-surface-400 block mb-1">
											To (consumes)
										</label>
										<select
											bind:value={factTo}
											class="w-full bg-surface-700 border border-surface-600 rounded px-2 py-1.5
												text-[10px] text-surface-100 focus:outline-none focus:border-hecate-500"
										>
											<option value={null}>Select...</option>
											{#each $eventClusters as c}
												<option value={c.cluster_id}>{c.name ?? 'Unnamed'}</option>
											{/each}
										</select>
									</div>

									<button
										onclick={handleAddFact}
										disabled={!factFrom || !factTo || factFrom === factTo || !factName.trim()}
										class="px-3 py-1.5 rounded text-[10px] transition-colors shrink-0
											{factFrom && factTo && factFrom !== factTo && factName.trim()
											? 'bg-hecate-600/20 text-hecate-300 hover:bg-hecate-600/30'
											: 'bg-surface-700 text-surface-500 cursor-not-allowed'}"
									>
										Add
									</button>
								</div>
							</div>
						{/if}
					</div>
				</div>

				<div class="border-t border-surface-600 p-3 shrink-0">
					<div class="flex items-center justify-between">
						<div class="flex gap-2">
							{#each $bigPictureAgents.slice(2) as agent}
								<button
									onclick={() =>
										openAIAssist(
											buildAgentContext(agent.prompt),
											agent.id
										)}
									class="flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded
										text-surface-400 hover:text-hecate-300
										hover:bg-hecate-600/10 transition-colors"
								>
									<span>{agent.icon}</span>
									<span>Ask {agent.name}</span>
								</button>
							{/each}
						</div>

						<button
							onclick={handlePromote}
							disabled={$isLoading}
							class="text-[10px] px-4 py-1.5 rounded font-medium transition-colors
								{$isLoading
								? 'bg-surface-700 text-surface-500 cursor-not-allowed'
								: 'bg-hecate-600 text-surface-50 hover:bg-hecate-500'}"
						>
							{$isLoading ? 'Promoting...' : 'Promote to Divisions'}
						</button>
					</div>
				</div>
			</div>

		<!-- PHASE: PROMOTED (complete) -->
		{:else if $bigPicturePhase === 'promoted'}
			<div class="flex items-center justify-center h-full">
				<div class="text-center max-w-md mx-4">
					<div class="text-4xl mb-4 text-health-ok">{'\u{2713}'}</div>
					<h2 class="text-lg font-semibold text-surface-100 mb-2">
						Context Map Complete
					</h2>
					<p class="text-xs text-surface-400 mb-4">
						{$eventClusters.length} divisions identified from
						{$bigPictureEventCount} domain events, with
						{$factArrows.length} integration fact{$factArrows.length !== 1 ? 's' : ''} mapped.
					</p>
					<p class="text-xs text-surface-400 mb-6">
						Select a division from the sidebar to begin Design-Level
						Event Storming in its DnA phase.
					</p>
					<button
						onclick={resetBigPicture}
						class="text-[10px] px-3 py-1 rounded
							text-surface-400 hover:text-surface-200 hover:bg-surface-700 transition-colors"
					>
						Reset Board
					</button>
				</div>
			</div>

		<!-- PHASE: SHELVED -->
		{:else if $bigPicturePhase === 'shelved'}
			<div class="flex items-center justify-center h-full">
				<div class="text-center max-w-md mx-4">
					<div class="text-4xl mb-4 text-health-warn">{'\u{23F8}'}</div>
					<h2 class="text-lg font-semibold text-surface-100 mb-2">
						Storm Shelved
					</h2>
					<p class="text-xs text-surface-400 mb-6">
						This storm session has been shelved. You can resume it at any time
						to continue where you left off.
					</p>
					<button
						onclick={() => resumeStorm(vid())}
						class="px-6 py-3 rounded-lg text-sm font-medium
							bg-hecate-600 text-surface-50 hover:bg-hecate-500
							transition-colors"
					>
						Resume Storm
					</button>
				</div>
			</div>
		{/if}
	</div>
</div>
