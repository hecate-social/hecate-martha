<script lang="ts">
	import { activeVenture } from '$lib/guide_venture/guide_venture.js';
	import {
		ventureRawEvents,
		fetchVentureEvents,
		type RawEvent
	} from '$lib/storm_venture_big_picture/storm_venture_big_picture.js';

	const PAGE_SIZE = 50;

	let loading = $state(false);
	let totalCount = $state(0);
	let offset = $state(0);
	let expandedIndices = $state<Set<number>>(new Set());

	let hasMore = $derived(offset + PAGE_SIZE < totalCount);
	let events = $derived($ventureRawEvents);

	async function loadEvents(ventureId: string, resetOffset = true) {
		loading = true;
		if (resetOffset) {
			offset = 0;
			expandedIndices = new Set();
		}
		try {
			const result = await fetchVentureEvents(ventureId, offset, PAGE_SIZE);
			totalCount = result.count;
		} finally {
			loading = false;
		}
	}

	async function loadMore() {
		const venture = $activeVenture;
		if (!venture || loading) return;
		offset += PAGE_SIZE;
		loading = true;
		try {
			const result = await fetchVentureEvents(venture.venture_id, offset, PAGE_SIZE);
			totalCount = result.count;
		} finally {
			loading = false;
		}
	}

	function toggleExpand(index: number) {
		const next = new Set(expandedIndices);
		if (next.has(index)) {
			next.delete(index);
		} else {
			next.add(index);
		}
		expandedIndices = next;
	}

	function eventColor(eventType: string): string {
		if (eventType.startsWith('venture_') || eventType.startsWith('big_picture_storm_')) {
			return 'text-hecate-400';
		}
		if (eventType.startsWith('event_sticky_')) {
			return 'text-es-event';
		}
		if (eventType.startsWith('event_stack_') || eventType.startsWith('event_cluster_')) {
			return 'text-success-400';
		}
		if (eventType.startsWith('fact_arrow_')) {
			return 'text-sky-400';
		}
		if (eventType.startsWith('storm_phase_')) {
			return 'text-accent-400';
		}
		return 'text-surface-400';
	}

	function formatTimestamp(ts: number | string | undefined): string {
		if (!ts) return '';
		const numTs = typeof ts === 'string' ? Number(ts) || new Date(ts).getTime() : ts;
		if (isNaN(numTs)) return '';
		const date = new Date(numTs);
		const now = Date.now();
		const diffMs = now - numTs;
		const diffSec = Math.floor(diffMs / 1000);

		if (diffSec < 60) return `${diffSec}s ago`;
		const diffMin = Math.floor(diffSec / 60);
		if (diffMin < 60) return `${diffMin}m ago`;
		const diffHr = Math.floor(diffMin / 60);
		if (diffHr < 24) return `${diffHr}h ago`;
		const diffDay = Math.floor(diffHr / 24);
		if (diffDay < 7) return `${diffDay}d ago`;

		return date.toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function formatJson(data: Record<string, unknown>): string {
		try {
			return JSON.stringify(data, null, 2);
		} catch {
			return String(data);
		}
	}

	// Auto-fetch when activeVenture changes
	$effect(() => {
		const venture = $activeVenture;
		if (venture) {
			loadEvents(venture.venture_id);
		}
	});
</script>

<div class="flex flex-col h-full">
	<!-- Header -->
	<div class="border-b border-surface-600 bg-surface-800/50 px-4 py-2 shrink-0">
		<div class="flex items-center gap-2">
			<span class="text-xs text-surface-400">Event Stream</span>

			{#if events.length > 0}
				<span class="text-[9px] text-surface-500">
					{events.length}{totalCount > events.length ? ` / ${totalCount}` : ''} events
				</span>
			{/if}

			<div class="flex-1"></div>

			<button
				onclick={() => {
					const venture = $activeVenture;
					if (venture) loadEvents(venture.venture_id);
				}}
				disabled={loading || !$activeVenture}
				class="text-[10px] px-2 py-0.5 rounded transition-colors
					{loading || !$activeVenture
					? 'text-surface-500 cursor-not-allowed'
					: 'text-surface-400 hover:text-surface-200 hover:bg-surface-700'}"
				title="Refresh events"
			>
				{loading ? 'Loading...' : 'Refresh'}
			</button>
		</div>
	</div>

	<!-- Event list -->
	<div class="flex-1 overflow-y-auto">
		{#if loading && events.length === 0}
			<!-- Loading state -->
			<div class="flex items-center justify-center h-full">
				<div class="text-center text-surface-400">
					<div class="text-sm mb-2 animate-pulse">...</div>
					<div class="text-[10px]">Loading events</div>
				</div>
			</div>
		{:else if !$activeVenture}
			<!-- No venture selected -->
			<div class="flex items-center justify-center h-full">
				<div class="text-center text-surface-500 text-xs">
					Select a venture to view its event stream.
				</div>
			</div>
		{:else if events.length === 0}
			<!-- Empty state -->
			<div class="flex items-center justify-center h-full">
				<div class="text-center text-surface-500">
					<div class="text-lg mb-2">{'\u{25CB}'}</div>
					<div class="text-xs">No events recorded yet.</div>
					<div class="text-[10px] mt-1">
						Events will appear here as the venture progresses.
					</div>
				</div>
			</div>
		{:else}
			<div class="divide-y divide-surface-700/50">
				{#each events as event, i (i)}
					{@const expanded = expandedIndices.has(i)}
					{@const colorCls = eventColor(event.event_type)}

					<div class="group">
						<!-- Event row -->
						<button
							onclick={() => toggleExpand(i)}
							class="w-full text-left px-4 py-2 flex items-start gap-2
								hover:bg-surface-700/30 transition-colors"
						>
							<!-- Expand indicator -->
							<span class="text-[9px] text-surface-500 mt-0.5 shrink-0 w-3">
								{expanded ? '\u{25BE}' : '\u{25B8}'}
							</span>

							<!-- Event type -->
							<span class="text-[11px] font-mono {colorCls} flex-1 min-w-0 truncate">
								{event.event_type}
							</span>

							<!-- Version badge -->
							{#if event.version !== undefined}
								<span class="text-[9px] px-1 py-0.5 rounded bg-surface-700 text-surface-400 shrink-0">
									v{event.version}
								</span>
							{/if}

							<!-- Timestamp -->
							{#if event.timestamp}
								<span class="text-[9px] text-surface-500 shrink-0 tabular-nums">
									{formatTimestamp(event.timestamp)}
								</span>
							{/if}
						</button>

						<!-- Expanded JSON payload -->
						{#if expanded}
							<div class="px-4 pb-3 pt-0 ml-5">
								<pre class="text-[10px] text-surface-300 bg-surface-800 border border-surface-600
									rounded p-3 overflow-x-auto whitespace-pre-wrap break-words
									font-mono leading-relaxed">{formatJson(event.data)}</pre>
							</div>
						{/if}
					</div>
				{/each}
			</div>

			<!-- Load more -->
			{#if hasMore}
				<div class="p-3 border-t border-surface-700/50">
					<button
						onclick={loadMore}
						disabled={loading}
						class="w-full text-[10px] py-1.5 rounded transition-colors
							{loading
							? 'bg-surface-700 text-surface-500 cursor-not-allowed'
							: 'bg-surface-700 text-surface-300 hover:text-surface-100 hover:bg-surface-600'}"
					>
						{loading ? 'Loading...' : `Load More (${totalCount - events.length} remaining)`}
					</button>
				</div>
			{/if}
		{/if}
	</div>
</div>
