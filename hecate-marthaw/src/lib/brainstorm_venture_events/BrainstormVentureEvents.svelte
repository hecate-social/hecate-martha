<script lang="ts">
	import {
		stickyNotes,
		addStickyNote,
		removeStickyNote,
		updateStickyNote,
		type StickyNoteType
	} from './brainstorm_venture_events.js';

	let newText = $state('');
	let selectedType = $state<StickyNoteType>('domain_event');
	let editingId = $state<string | null>(null);
	let editText = $state('');

	const STICKY_COLORS: Record<StickyNoteType, string> = {
		domain_event: 'bg-amber-500/20 border-amber-500/40 text-amber-200',
		command: 'bg-blue-500/20 border-blue-500/40 text-blue-200',
		aggregate: 'bg-yellow-500/20 border-yellow-500/40 text-yellow-200',
		policy: 'bg-purple-500/20 border-purple-500/40 text-purple-200',
		read_model: 'bg-green-500/20 border-green-500/40 text-green-200',
		external_system: 'bg-pink-500/20 border-pink-500/40 text-pink-200'
	};

	const TYPE_LABELS: Record<StickyNoteType, string> = {
		domain_event: 'Domain Event',
		command: 'Command',
		aggregate: 'Aggregate',
		policy: 'Policy',
		read_model: 'Read Model',
		external_system: 'External System'
	};

	function handleAdd() {
		if (!newText.trim()) return;
		addStickyNote(selectedType, newText.trim());
		newText = '';
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleAdd();
		}
	}

	function startEdit(id: string, text: string) {
		editingId = id;
		editText = text;
	}

	function saveEdit() {
		if (editingId && editText.trim()) {
			updateStickyNote(editingId, editText.trim());
		}
		editingId = null;
		editText = '';
	}

	function cancelEdit() {
		editingId = null;
		editText = '';
	}
</script>

<div class="flex flex-col h-full">
	<!-- Header -->
	<div class="border-b border-surface-600 bg-surface-800/50 px-4 py-3 shrink-0">
		<div class="flex items-center gap-3">
			<h3 class="text-sm font-semibold text-surface-100">
				Event Brainstorming
			</h3>
			<span class="text-[10px] px-2 py-0.5 rounded-full border border-amber-500/30
				bg-amber-500/10 text-amber-300">
				{$stickyNotes.length} stickies
			</span>
			<p class="text-[11px] text-surface-400 ml-auto">
				Post domain events as fast as you can. No filtering, no judging.
			</p>
		</div>
	</div>

	<!-- Input area -->
	<div class="border-b border-surface-600 bg-surface-800/30 px-4 py-3 shrink-0">
		<div class="flex gap-2 items-end">
			<div class="flex-1">
				<div class="flex gap-1.5 mb-2">
					{#each Object.entries(TYPE_LABELS) as [type, label]}
						<button
							onclick={() => (selectedType = type as StickyNoteType)}
							class="text-[10px] px-2 py-0.5 rounded transition-colors
								{selectedType === type
								? STICKY_COLORS[type as StickyNoteType]
								: 'text-surface-400 hover:text-surface-200 bg-surface-700/50'}"
						>
							{label}
						</button>
					{/each}
				</div>
				<input
					bind:value={newText}
					onkeydown={handleKeydown}
					placeholder="Type a domain event (e.g., OrderPlaced, UserRegistered)..."
					class="w-full bg-surface-700 border border-surface-600 rounded
						px-3 py-2 text-xs text-surface-100 placeholder-surface-400
						focus:outline-none focus:border-amber-500/50"
				/>
			</div>
			<button
				onclick={handleAdd}
				disabled={!newText.trim()}
				class="px-4 py-2 rounded text-xs font-medium transition-colors
					{newText.trim()
					? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
					: 'bg-surface-700 text-surface-500 cursor-not-allowed'}"
			>
				Post Sticky
			</button>
		</div>
	</div>

	<!-- Sticky board -->
	<div class="flex-1 overflow-y-auto p-4">
		{#if $stickyNotes.length === 0}
			<div class="flex flex-col items-center justify-center h-full text-center">
				<div class="text-4xl mb-4 opacity-30">&#x1F4CC;</div>
				<p class="text-sm text-surface-300 mb-1">No stickies yet</p>
				<p class="text-[11px] text-surface-400 max-w-sm">
					Start brainstorming! Post domain events that happen in your system.
					Think about what triggers actions and what the outcomes are.
				</p>
			</div>
		{:else}
			<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
				{#each $stickyNotes as note (note.id)}
					<div
						class="relative rounded-lg border p-3 transition-all hover:scale-[1.02]
							{STICKY_COLORS[note.type]}"
					>
						<!-- Type badge -->
						<div class="text-[9px] uppercase tracking-wider opacity-60 mb-1.5">
							{TYPE_LABELS[note.type]}
						</div>

						<!-- Content -->
						{#if editingId === note.id}
							<input
								bind:value={editText}
								onkeydown={(e) => {
									if (e.key === 'Enter') saveEdit();
									if (e.key === 'Escape') cancelEdit();
								}}
								onblur={saveEdit}
								class="w-full bg-transparent border-b border-current/30
									text-xs focus:outline-none"
							/>
						{:else}
							<div
								class="text-xs font-medium cursor-pointer"
								ondblclick={() => startEdit(note.id, note.text)}
								role="button"
								tabindex="0"
								onkeydown={(e) => {
									if (e.key === 'Enter') startEdit(note.id, note.text);
								}}
							>
								{note.text}
							</div>
						{/if}

						<!-- Remove button -->
						<button
							onclick={() => removeStickyNote(note.id)}
							class="absolute top-1.5 right-1.5 text-[10px] opacity-0
								group-hover:opacity-100 hover:opacity-100 transition-opacity
								hover:text-red-400"
							title="Remove sticky"
						>
							&#x2715;
						</button>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>
