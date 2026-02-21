<script lang="ts">
	import { availableModels, modelAffinity } from './aiStore.js';

	interface Props {
		currentModel: string | null;
		onSelect: (name: string) => void;
		showPhaseInfo?: boolean;
		phasePreference?: string | null;
		phaseAffinity?: 'code' | 'general';
		onPinModel?: (name: string) => void;
		onClearPin?: () => void;
		phaseName?: string;
	}

	let {
		currentModel,
		onSelect,
		showPhaseInfo = false,
		phasePreference = null,
		phaseAffinity = 'general',
		onPinModel,
		onClearPin,
		phaseName = ''
	}: Props = $props();

	let isOpen = $state(false);
	let searchQuery = $state('');
	let dropdownEl: HTMLDivElement | undefined = $state();

	// Group models by provider
	type ModelGroup = { provider: string; models: string[] };

	let groupedModels = $derived.by(() => {
		const models = $availableModels;
		const q = searchQuery.toLowerCase();
		const filtered = q ? models.filter((m) => m.toLowerCase().includes(q)) : models;

		const groups = new Map<string, string[]>();
		for (const name of filtered) {
			const provider = guessProvider(name);
			const list = groups.get(provider) ?? [];
			list.push(name);
			groups.set(provider, list);
		}

		const result: ModelGroup[] = [];
		for (const [provider, list] of groups) {
			result.push({ provider, models: list });
		}
		return result;
	});

	function guessProvider(name: string): string {
		if (name.startsWith('claude') || name.startsWith('anthropic')) return 'Anthropic';
		if (name.startsWith('gemini') || name.startsWith('gemma')) return 'Google';
		if (name.startsWith('llama') || name.startsWith('meta-llama')) return 'Meta';
		if (name.startsWith('qwen')) return 'Alibaba';
		if (name.startsWith('groq/')) return 'Groq';
		if (name.startsWith('openai/') || name.startsWith('gpt')) return 'OpenAI';
		if (name.includes('/')) return name.split('/')[0];
		return 'Other';
	}

	function handleSelect(name: string) {
		onSelect(name);
		isOpen = false;
		searchQuery = '';
	}

	function handleClickOutside(e: MouseEvent) {
		if (dropdownEl && !dropdownEl.contains(e.target as Node)) {
			isOpen = false;
			searchQuery = '';
		}
	}

	function shortName(name: string): string {
		// Trim long model names for the button display
		if (name.length <= 24) return name;
		return name.slice(0, 22) + '\u2026';
	}

	$effect(() => {
		if (isOpen) {
			document.addEventListener('click', handleClickOutside, true);
		} else {
			document.removeEventListener('click', handleClickOutside, true);
		}
		return () => document.removeEventListener('click', handleClickOutside, true);
	});
</script>

<div class="relative" bind:this={dropdownEl}>
	<!-- Trigger button -->
	<button
		onclick={() => (isOpen = !isOpen)}
		class="text-[10px] px-2 py-0.5 rounded bg-surface-700 text-surface-300
			hover:bg-surface-600 transition-colors truncate max-w-[180px] flex items-center gap-1"
		title={currentModel ?? 'No model selected'}
	>
		{#if currentModel}
			<span class="truncate">{shortName(currentModel)}</span>
			{#if modelAffinity(currentModel) === 'code'}
				<span class="text-[8px] text-phase-tni">{'\u{2022}'}</span>
			{/if}
		{:else}
			<span class="text-surface-500">Select model</span>
		{/if}
		<span class="text-[8px] ml-0.5">{isOpen ? '\u{25B2}' : '\u{25BC}'}</span>
	</button>

	<!-- Dropdown -->
	{#if isOpen}
		<div
			class="absolute top-full left-0 mt-1 w-72 max-h-80 overflow-hidden
				bg-surface-800 border border-surface-600 rounded-lg shadow-xl z-50
				flex flex-col"
		>
			<!-- Search input -->
			<div class="p-2 border-b border-surface-700">
				<input
					bind:value={searchQuery}
					placeholder="Search models..."
					class="w-full bg-surface-700 border border-surface-600 rounded px-2 py-1
						text-[11px] text-surface-100 placeholder-surface-500
						focus:outline-none focus:border-hecate-500"
				/>
			</div>

			<!-- Phase info -->
			{#if showPhaseInfo && phaseName}
				<div class="px-2 py-1.5 border-b border-surface-700 flex items-center justify-between">
					<span class="text-[9px] text-surface-400">
						Phase: <span class="text-surface-200">{phaseName}</span>
						{#if phaseAffinity === 'code'}
							<span class="text-phase-tni ml-1">(code-optimized)</span>
						{/if}
					</span>
					{#if phasePreference}
						<button
							onclick={() => onClearPin?.()}
							class="text-[9px] text-surface-500 hover:text-surface-300"
							title="Clear pinned model for this phase"
						>
							Unpin
						</button>
					{/if}
				</div>
			{/if}

			<!-- Model list -->
			<div class="overflow-y-auto flex-1">
				{#if groupedModels.length === 0}
					<div class="p-3 text-center text-[11px] text-surface-500">
						{$availableModels.length === 0 ? 'No models available' : 'No matching models'}
					</div>
				{/if}

				{#each groupedModels as group}
					<div class="py-1">
						<div class="px-2 py-1 text-[9px] text-surface-500 uppercase tracking-wider font-medium">
							{group.provider}
						</div>
						{#each group.models as name}
							{@const isSelected = name === currentModel}
							{@const isPinned = name === phasePreference}
							<!-- svelte-ignore a11y_click_events_have_key_events -->
							<!-- svelte-ignore a11y_no_static_element_interactions -->
							<div
								onclick={() => handleSelect(name)}
								class="w-full text-left px-2 py-1.5 text-[11px] flex items-center gap-1.5
									transition-colors cursor-pointer
									{isSelected
									? 'bg-hecate-600/20 text-hecate-300'
									: 'text-surface-200 hover:bg-surface-700'}"
							>
								<span class="truncate flex-1">{name}</span>
								{#if modelAffinity(name) === 'code'}
									<span class="text-[8px] text-phase-tni shrink-0" title="Code model">{'\u{2022}'} code</span>
								{/if}
								{#if isPinned}
									<span class="text-[8px] text-hecate-400 shrink-0" title="Pinned for this phase">{'\u{1F4CC}'}</span>
								{/if}
								{#if isSelected}
									<span class="text-[9px] text-hecate-400 shrink-0">{'\u{2713}'}</span>
								{/if}
								{#if showPhaseInfo && onPinModel && !isPinned}
									<button
										onclick={(e: MouseEvent) => { e.stopPropagation(); onPinModel?.(name); }}
										class="text-[8px] text-surface-600 hover:text-hecate-400 shrink-0"
										title="Pin for {phaseName} phase"
									>
										pin
									</button>
								{/if}
							</div>
						{/each}
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>
