<script lang="ts">
	import {
		activeVenture,
		isLoading,
		fetchActiveVenture,
		fetchVentures,
		ventureError,
		scaffoldVentureRepo
	} from '$lib/guide_venture/guide_venture.js';
	import { aiModel, setAIModelOverride } from '$lib/shared/aiStore.js';
	import { systemPrompt } from '$lib/shared/personality.js';
	import { visionOraclePrompt, applyVariables } from '$lib/shared/agentsStore.js';
	import { createStudioContext } from '$lib/shared/context.js';
	import type { ChatStream } from '$lib/shared/context.js';
	import ModelSelector from '$lib/shared/ModelSelector.svelte';
	import type { ChatMessage, StreamChunk } from '$lib/types.js';
	import { tick } from 'svelte';
	import { get } from 'svelte/store';

	const ctx = createStudioContext();

	let chatMessages: ChatMessage[] = $state([]);
	let inputValue = $state('');
	let isStreaming = $state(false);
	let streamingContent = $state('');
	let messagesEl: HTMLDivElement | undefined = $state();
	let isScaffolding = $state(false);
	let scaffoldError = $state('');
	let repoPath = $state('');
	let activeStream: ChatStream | null = $state(null);
	let prevModel: string | null = $state(null);

	// Resizable split pane
	let splitPercent = $state(65);
	let isDragging = $state(false);
	let containerEl: HTMLDivElement | undefined = $state();

	// Strip vision markdown fences from chat display — show indicator instead
	function stripVisionFences(content: string): string {
		let result = content.replace(
			/```markdown\n[\s\S]*?```/g,
			'\u{25C7} Vision updated \u{2197}'
		);
		result = result.replace(
			/```markdown\n[\s\S]*$/,
			'\u{25C7} Synthesizing vision... \u{2197}'
		);
		return result;
	}

	// Parse content into text and think parts (like ChatMessage.svelte)
	interface ContentPart {
		type: 'text' | 'think';
		content: string;
	}

	function parseContentParts(raw: string): ContentPart[] {
		const content = stripVisionFences(raw);
		const result: ContentPart[] = [];
		let remaining = content;

		while (remaining.length > 0) {
			const openIdx = remaining.indexOf('<think>');
			if (openIdx === -1) {
				if (remaining.trim()) result.push({ type: 'text', content: remaining });
				break;
			}
			if (openIdx > 0) {
				const before = remaining.slice(0, openIdx);
				if (before.trim()) result.push({ type: 'text', content: before });
			}
			const closeIdx = remaining.indexOf('</think>', openIdx);
			if (closeIdx === -1) {
				const thinkContent = remaining.slice(openIdx + 7);
				if (thinkContent.trim()) result.push({ type: 'think', content: thinkContent });
				break;
			}
			const thinkContent = remaining.slice(openIdx + 7, closeIdx);
			if (thinkContent.trim()) result.push({ type: 'think', content: thinkContent });
			remaining = remaining.slice(closeIdx + 8);
		}

		return result.length > 0 ? result : [{ type: 'text', content }];
	}

	// Streaming: detect if currently inside an unclosed <think> block
	function isStreamingThink(content: string): boolean {
		return content.includes('<think>') && !content.includes('</think>');
	}

	function getStreamingVisibleContent(raw: string): string {
		const content = stripVisionFences(raw);
		if (!content.includes('</think>')) {
			return content.includes('<think>') ? '' : content;
		}
		return (content.split('</think>').pop() || '').trim();
	}

	function getStreamingThinkContent(raw: string): string {
		const content = stripVisionFences(raw);
		const openIdx = content.indexOf('<think>');
		if (openIdx === -1) return '';
		const closeIdx = content.indexOf('</think>');
		if (closeIdx === -1) return content.slice(openIdx + 7);
		return content.slice(openIdx + 7, closeIdx);
	}

	// Extract latest vision from conversation
	let extractedVision = $derived.by(() => {
		for (let i = chatMessages.length - 1; i >= 0; i--) {
			if (chatMessages[i].role === 'assistant') {
				const match = chatMessages[i].content.match(/```markdown\n([\s\S]*?)```/);
				if (match) return match[1].trim();
			}
		}
		// Also check streaming content — complete or partial fence
		if (streamingContent) {
			const completeMatch = streamingContent.match(/```markdown\n([\s\S]*?)```/);
			if (completeMatch) return completeMatch[1].trim();
			const partialMatch = streamingContent.match(/```markdown\n([\s\S]*)$/);
			if (partialMatch) return partialMatch[1].trim();
		}
		return null;
	});

	// Is the vision complete (all sections confirmed, no hypotheticals remaining)?
	let visionComplete = $derived(
		extractedVision !== null &&
		!extractedVision.includes('(Not yet explored)') &&
		!extractedVision.includes('*(Hypothetical)*')
	);

	// Extract brief from vision (<!-- brief: ... --> tag)
	let extractedBrief = $derived.by(() => {
		if (!extractedVision) return null;
		const match = extractedVision.match(/<!--\s*brief:\s*(.*?)\s*-->/);
		return match ? match[1].trim() : null;
	});

	// Track which venture the chat belongs to — reset on change
	let currentVentureId: string | null = $state(null);

	$effect(() => {
		const venture = $activeVenture;
		const ventureId = venture?.venture_id ?? null;

		if (ventureId !== currentVentureId) {
			// Venture changed — reset chat state
			chatMessages = [];
			streamingContent = '';
			isStreaming = false;
			scaffoldError = '';
			repoPath = '';
			currentVentureId = ventureId;
		}

		// Set default repo path when venture is available
		if (venture && !repoPath) {
			const home = '~/ventures';
			const name = venture.name.toLowerCase().replace(/[^a-z0-9-]/g, '-');
			repoPath = `${home}/${name}`;
		}
	});

	// When model changes, cancel in-flight stream and reset conversation
	$effect(() => {
		const model = $aiModel;
		if (prevModel !== null && prevModel !== model) {
			if (activeStream) {
				activeStream.cancel();
				activeStream = null;
			}
			chatMessages = [];
			streamingContent = '';
			isStreaming = false;
		}
		prevModel = model;
	});

	// Auto-start Oracle greeting when chat is empty and venture is ready
	$effect(() => {
		const venture = $activeVenture;
		if (venture && chatMessages.length === 0 && !isStreaming) {
			const greeting = `I just initiated a new venture called "${venture.name}". ${venture.brief ? `Here's what I know so far: ${venture.brief}` : 'I need help defining the vision for this venture.'}`;
			sendMessage(greeting);
		}
	});

	function buildOracleSystemPrompt(): string {
		const parts: string[] = [];

		const sysPrompt = get(systemPrompt);
		if (sysPrompt) {
			parts.push(sysPrompt);
		}

		const template = get(visionOraclePrompt);
		parts.push(applyVariables(template, {
			venture_name: $activeVenture?.name ?? 'Unnamed'
		}));

		if ($activeVenture) {
			let ventureCtx = `The venture is called "${$activeVenture.name}"`;
			if ($activeVenture.brief) ventureCtx += `. Initial brief: ${$activeVenture.brief}`;
			parts.push(ventureCtx);
		}

		return parts.join('\n\n---\n\n');
	}

	async function sendMessage(content: string) {
		const model = $aiModel;
		if (!model || !content.trim() || isStreaming) return;

		const userMsg: ChatMessage = { role: 'user', content: content.trim() };
		chatMessages = [...chatMessages, userMsg];
		inputValue = '';

		const allMessages: ChatMessage[] = [];
		const sys = buildOracleSystemPrompt();
		if (sys) {
			allMessages.push({ role: 'system', content: sys });
		}
		allMessages.push(...chatMessages);

		isStreaming = true;
		streamingContent = '';

		let accumulated = '';

		const stream = ctx.stream.chat(model, allMessages);
		activeStream = stream;

		stream
			.onChunk((chunk: StreamChunk) => {
				if (chunk.content) {
					accumulated += chunk.content;
					streamingContent = accumulated;
				}
			})
			.onDone(async (chunk: StreamChunk) => {
				if (chunk.content) {
					accumulated += chunk.content;
				}
				const assistantMsg: ChatMessage = {
					role: 'assistant',
					content: accumulated || '(empty response)'
				};
				chatMessages = [...chatMessages, assistantMsg];
				streamingContent = '';
				isStreaming = false;
				activeStream = null;
			})
			.onError((error: string) => {
				const errorMsg: ChatMessage = {
					role: 'assistant',
					content: `Error: ${error}`
				};
				chatMessages = [...chatMessages, errorMsg];
				streamingContent = '';
				isStreaming = false;
				activeStream = null;
			});

		try {
			await stream.start();
		} catch (e) {
			const errorMsg: ChatMessage = {
				role: 'assistant',
				content: `Error: ${String(e)}`
			};
			chatMessages = [...chatMessages, errorMsg];
			isStreaming = false;
		}
	}

	async function handleScaffold() {
		if (!$activeVenture || !extractedVision || !repoPath.trim()) return;

		isScaffolding = true;
		scaffoldError = '';

		const ok = await scaffoldVentureRepo(
			$activeVenture.venture_id,
			repoPath.trim(),
			extractedVision,
			$activeVenture.name,
			extractedBrief ?? undefined
		);

		if (ok) {
			await fetchActiveVenture();
			await fetchVentures();
		} else {
			scaffoldError = get(ventureError) || 'Failed to scaffold venture repo';
		}

		isScaffolding = false;
	}

	let inputEl: HTMLTextAreaElement | undefined = $state();

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			sendMessage(inputValue);
			if (inputEl) inputEl.style.height = 'auto';
		}
	}

	function autoResize(e: Event) {
		const target = e.target as HTMLTextAreaElement;
		target.style.height = 'auto';
		target.style.height = Math.min(target.scrollHeight, 150) + 'px';
	}

	// Resize drag handlers
	function handleDragStart(e: MouseEvent) {
		isDragging = true;
		e.preventDefault();
	}

	function handleDragMove(e: MouseEvent) {
		if (!isDragging || !containerEl) return;
		const rect = containerEl.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const pct = (x / rect.width) * 100;
		splitPercent = Math.max(30, Math.min(80, pct));
	}

	function handleDragEnd() {
		isDragging = false;
	}

	// Auto-scroll
	$effect(() => {
		chatMessages;
		streamingContent;
		tick().then(() => {
			if (messagesEl) {
				messagesEl.scrollTop = messagesEl.scrollHeight;
			}
		});
	});

	// Simple markdown rendering for vision preview
	function renderVisionPreview(md: string): string {
		return md
			.replace(/<!--.*?-->/gs, '')
			.replace(/^### (.*$)/gm, '<h3 class="text-xs font-semibold text-surface-100 mt-3 mb-1">$1</h3>')
			.replace(/^## (.*$)/gm, '<h2 class="text-sm font-semibold text-hecate-300 mt-4 mb-1.5">$1</h2>')
			.replace(/^# (.*$)/gm, '<h1 class="text-base font-bold text-surface-100 mb-2">$1</h1>')
			.replace(/^(\d+)\.\s+(.*$)/gm, '<div class="text-[11px] text-surface-200 ml-3 mb-1"><span class="text-surface-400 mr-1.5">$1.</span>$2</div>')
			.replace(/^\- (.*$)/gm, '<div class="text-[11px] text-surface-200 ml-3 mb-1"><span class="text-surface-400 mr-1.5">&bull;</span>$1</div>')
			.replace(/\*\*(.*?)\*\*/g, '<strong class="text-surface-100">$1</strong>')
			.replace(/\*(.*?)\*/g, '<em class="text-surface-300">$1</em>')
			.replace(/\n\n/g, '<br/><br/>')
			.trim();
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	bind:this={containerEl}
	class="flex h-full overflow-hidden"
	onmousemove={handleDragMove}
	onmouseup={handleDragEnd}
	onmouseleave={handleDragEnd}
>
	<!-- Chat Pane -->
	<div class="flex flex-col overflow-hidden" style="width: {splitPercent}%">
		<!-- Header -->
		<div class="flex items-center gap-2 px-4 py-2.5 border-b border-surface-600 shrink-0">
			<span class="text-hecate-400">{'\u{25C7}'}</span>
			<span class="text-xs font-semibold text-surface-100">The Oracle</span>
			<span class="text-[10px] text-surface-400">Vision Architect</span>
			<div class="flex-1"></div>
			<ModelSelector currentModel={$aiModel} onSelect={(name) => setAIModelOverride(name)} />
		</div>

		<!-- Messages -->
		<div bind:this={messagesEl} class="flex-1 overflow-y-auto p-4 space-y-3">
			{#each chatMessages as msg}
				{#if msg.role === 'user'}
					<div class="flex justify-end">
						<div
							class="max-w-[85%] rounded-lg px-3 py-2 text-[11px]
							bg-hecate-600/20 text-surface-100 border border-hecate-600/20"
						>
							<div class="whitespace-pre-wrap break-words">{msg.content}</div>
						</div>
					</div>
				{:else if msg.role === 'assistant'}
					<div class="flex justify-start">
						<div
							class="max-w-[85%] rounded-lg px-3 py-2 text-[11px]
							bg-surface-700 text-surface-200 border border-surface-600
							{msg.content.startsWith('Error:') ? 'border-health-err/30 text-health-err' : ''}"
						>
							{#each parseContentParts(msg.content) as part}
								{#if part.type === 'think'}
									<details class="mb-1.5 group">
										<summary class="text-[10px] text-surface-400 cursor-pointer hover:text-surface-300
											select-none flex items-center gap-1">
											<span class="text-[9px] transition-transform group-open:rotate-90">{'\u{25B6}'}</span>
											Reasoning
										</summary>
										<div class="mt-1 pl-2 border-l-2 border-surface-600 text-[10px] text-surface-400
											whitespace-pre-wrap break-words max-h-32 overflow-y-auto">
											{part.content.trim()}
										</div>
									</details>
								{:else}
									<div class="whitespace-pre-wrap break-words">{part.content.trim()}</div>
								{/if}
							{/each}
						</div>
					</div>
				{/if}
			{/each}

			{#if isStreaming}
				<div class="flex justify-start">
					<div
						class="max-w-[85%] rounded-lg px-3 py-2 text-[11px]
						bg-surface-700 text-surface-200 border border-surface-600"
					>
						{#if streamingContent && isStreamingThink(streamingContent)}
							<div class="flex items-center gap-2 text-surface-400 mb-1">
								<span class="flex gap-1">
									<span class="w-1.5 h-1.5 rounded-full bg-accent-500/60 animate-bounce" style="animation-delay: 0ms"></span>
									<span class="w-1.5 h-1.5 rounded-full bg-accent-500/60 animate-bounce" style="animation-delay: 150ms"></span>
									<span class="w-1.5 h-1.5 rounded-full bg-accent-500/60 animate-bounce" style="animation-delay: 300ms"></span>
								</span>
								<span class="text-[10px] text-accent-400/70">Reasoning...</span>
							</div>
							{#if getStreamingThinkContent(streamingContent).trim()}
								<details class="group">
									<summary class="text-[10px] text-surface-500 cursor-pointer hover:text-surface-400
										select-none flex items-center gap-1">
										<span class="text-[9px] transition-transform group-open:rotate-90">{'\u{25B6}'}</span>
										Show reasoning
									</summary>
									<div class="mt-1 pl-2 border-l-2 border-surface-600 text-[10px] text-surface-400
										whitespace-pre-wrap break-words max-h-32 overflow-y-auto">
										{getStreamingThinkContent(streamingContent).trim()}<span
											class="inline-block w-1 h-3 bg-accent-400/50 animate-pulse ml-0.5"></span>
									</div>
								</details>
							{/if}
						{:else if streamingContent}
							{#if getStreamingThinkContent(streamingContent).trim()}
								<details class="mb-1.5 group">
									<summary class="text-[10px] text-surface-400 cursor-pointer hover:text-surface-300
										select-none flex items-center gap-1">
										<span class="text-[9px] transition-transform group-open:rotate-90">{'\u{25B6}'}</span>
										Reasoning
									</summary>
									<div class="mt-1 pl-2 border-l-2 border-surface-600 text-[10px] text-surface-400
										whitespace-pre-wrap break-words max-h-32 overflow-y-auto">
										{getStreamingThinkContent(streamingContent).trim()}
									</div>
								</details>
							{/if}
							<div class="whitespace-pre-wrap break-words">
								{getStreamingVisibleContent(streamingContent)}<span
									class="inline-block w-1.5 h-3 bg-hecate-400 animate-pulse ml-0.5"></span>
							</div>
						{:else}
							<div class="flex items-center gap-1.5 text-surface-400">
								<span class="animate-bounce" style="animation-delay: 0ms">.</span>
								<span class="animate-bounce" style="animation-delay: 150ms">.</span>
								<span class="animate-bounce" style="animation-delay: 300ms">.</span>
							</div>
						{/if}
					</div>
				</div>
			{/if}

			{#if chatMessages.length === 0 && !isStreaming}
				<div class="flex items-center justify-center h-full">
					<div class="text-center text-surface-400">
						<div class="text-2xl mb-2">{'\u{25C7}'}</div>
						<div class="text-[11px]">The Oracle is preparing...</div>
					</div>
				</div>
			{/if}
		</div>

		<!-- Input -->
		<div class="border-t border-surface-600 p-3 shrink-0">
			<div class="flex gap-2">
				<textarea
					bind:this={inputEl}
					bind:value={inputValue}
					onkeydown={handleKeydown}
					oninput={autoResize}
					placeholder={isStreaming ? 'Oracle is thinking...' : 'Describe your venture...'}
					disabled={isStreaming || !$aiModel}
					rows={1}
					class="flex-1 bg-surface-700 border border-surface-600 rounded-lg px-3 py-2
						text-[11px] text-surface-100 placeholder-surface-400 resize-none
						focus:outline-none focus:border-hecate-500
						disabled:opacity-50 disabled:cursor-not-allowed"
				></textarea>
				<button
					onclick={() => sendMessage(inputValue)}
					disabled={isStreaming || !inputValue.trim() || !$aiModel}
					class="px-3 rounded-lg text-[11px] transition-colors self-end
						{isStreaming || !inputValue.trim() || !$aiModel
						? 'bg-surface-600 text-surface-400 cursor-not-allowed'
						: 'bg-hecate-600 text-surface-50 hover:bg-hecate-500'}"
				>
					Send
				</button>
			</div>
		</div>
	</div>

	<!-- Resize Handle -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="w-1 cursor-col-resize shrink-0 transition-colors
			{isDragging ? 'bg-hecate-500' : 'bg-surface-600 hover:bg-surface-500'}"
		onmousedown={handleDragStart}
	></div>

	<!-- Vision Preview Pane -->
	<div class="flex flex-col overflow-hidden flex-1">
		<!-- Preview Header -->
		<div class="flex items-center gap-2 px-4 py-2.5 border-b border-surface-600 shrink-0">
			<span class="text-surface-400 text-xs">{'\u{1F4C4}'}</span>
			<span class="text-xs font-semibold text-surface-100">Vision Preview</span>
			<div class="flex-1"></div>
			{#if visionComplete}
				<span class="text-[10px] text-health-ok">{'\u{25CF}'} Complete</span>
			{:else if extractedVision}
				<span class="text-[10px] text-accent-400">{'\u{25D0}'} Drafting...</span>
			{:else if isStreaming}
				<span class="text-[10px] text-surface-400">{'\u{25D0}'} Listening...</span>
			{:else}
				<span class="text-[10px] text-surface-400">Waiting for Oracle...</span>
			{/if}
		</div>

		<!-- Preview Content -->
		<div class="flex-1 overflow-y-auto p-4">
			{#if extractedVision}
				<div class="prose prose-sm prose-invert">
					{@html renderVisionPreview(extractedVision)}
				</div>

				{#if extractedBrief}
					<div class="mt-4 p-2 rounded bg-surface-700 border border-surface-600">
						<div class="text-[9px] text-surface-400 uppercase tracking-wider mb-1">Brief</div>
						<div class="text-[11px] text-surface-200">{extractedBrief}</div>
					</div>
				{/if}
			{:else}
				<div class="flex items-center justify-center h-full">
					<div class="text-center text-surface-400 max-w-[220px]">
						<div class="text-2xl mb-2">{'\u{1F4C4}'}</div>
						<div class="text-[11px]">
							Your vision will take shape here as the Oracle
							gathers context about your venture.
						</div>
					</div>
				</div>
			{/if}
		</div>

		<!-- Scaffold Action -->
		<div class="border-t border-surface-600 p-3 shrink-0">
			{#if visionComplete}
				<div class="space-y-2">
					<div>
						<label for="repo-path" class="text-[10px] text-surface-400 block mb-1">
							Repository Path
						</label>
						<input
							id="repo-path"
							bind:value={repoPath}
							placeholder="~/ventures/my-venture"
							class="w-full bg-surface-700 border border-surface-600 rounded px-3 py-1.5
								text-[11px] text-surface-100 placeholder-surface-400
								focus:outline-none focus:border-hecate-500"
						/>
					</div>

					{#if scaffoldError}
						<div class="text-[10px] text-health-err bg-health-err/10 rounded px-2 py-1">
							{scaffoldError}
						</div>
					{/if}

					<button
						onclick={handleScaffold}
						disabled={isScaffolding || $isLoading || !repoPath.trim()}
						class="w-full px-3 py-2 rounded-lg text-xs font-medium transition-colors
							{isScaffolding || $isLoading || !repoPath.trim()
							? 'bg-surface-600 text-surface-400 cursor-not-allowed'
							: 'bg-hecate-600 text-surface-50 hover:bg-hecate-500'}"
					>
						{isScaffolding ? 'Scaffolding...' : 'Scaffold Venture'}
					</button>
				</div>
			{:else if extractedVision}
				<div class="text-center text-[10px] text-surface-400 py-2">
					Vision is taking shape {'\u{2014}'} keep exploring with the Oracle
				</div>
			{:else}
				<div class="text-center text-[10px] text-surface-400 py-2">
					The Oracle will guide you through defining your venture
				</div>
			{/if}
		</div>
	</div>
</div>
