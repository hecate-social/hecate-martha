<script lang="ts">
	import {
		showAIAssist,
		closeAIAssist,
		aiAssistContext,
		aiAssistAgent,
		parseAgentEvents,
		PHASES,
		aiModel,
		phaseModelPrefs,
		setPhaseModel,
		setAIModelOverride,
		phaseAffinity
	} from '$lib/shared/aiStore.js';
	import { selectedPhase } from '$lib/shared/phaseStore.js';
	import { selectedDivision } from '$lib/guide_venture/guide_venture.js';
	import { activeVenture } from '$lib/guide_venture/guide_venture.js';
	import { postEventSticky } from '$lib/storm_venture_big_picture/storm_venture_big_picture.js';
	import { systemPrompt } from '$lib/shared/personality.js';
	import { assistGeneralPrompt } from '$lib/shared/agentsStore.js';
	import { createStudioContext, type ChatStream } from '$lib/shared/context.js';
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
	let activeStream: ChatStream | null = $state(null);
	let prevModel: string | null = $state(null);

	let currentAffinity = $derived(phaseAffinity($selectedPhase));
	let phasePref = $derived($phaseModelPrefs[$selectedPhase]);

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

	// Auto-start with context when opened
	$effect(() => {
		const context = $aiAssistContext;
		if (context && chatMessages.length === 0) {
			sendMessage(context);
		}
	});

	function buildSystemPrompt(): string {
		const parts: string[] = [];

		const sysPrompt = get(systemPrompt);
		if (sysPrompt) {
			parts.push(sysPrompt);
		}

		const phase = PHASES.find((p) => p.code === $selectedPhase);
		if (phase) {
			parts.push(
				`You are currently assisting with the ${phase.name} phase. ${phase.description}.`
			);
		}

		if ($activeVenture) {
			let ventureCtx = `Venture: "${$activeVenture.name}"`;
			if ($activeVenture.brief) ventureCtx += ` \u2014 ${$activeVenture.brief}`;
			parts.push(ventureCtx);
		}
		if ($selectedDivision) {
			parts.push(
				`Division: "${$selectedDivision.context_name}" (bounded context)`
			);
		}

		parts.push(get(assistGeneralPrompt));

		return parts.join('\n\n---\n\n');
	}

	async function sendMessage(content: string) {
		const model = $aiModel;
		if (!model || !content.trim() || isStreaming) return;

		const userMsg: ChatMessage = { role: 'user', content: content.trim() };
		chatMessages = [...chatMessages, userMsg];
		inputValue = '';

		const allMessages: ChatMessage[] = [];
		const sys = buildSystemPrompt();
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
				activeStream = null;
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

				// Auto-add events to the board when Oracle agent responds
				const agent = get(aiAssistAgent);
				if (agent === 'oracle' && accumulated) {
					const ventureId = get(activeVenture)?.venture_id;
					if (ventureId) {
						const events = parseAgentEvents(accumulated);
						for (const evt of events) {
							await postEventSticky(ventureId, evt, 'oracle');
						}
					}
				}
			})
			.onError((error: string) => {
				activeStream = null;
				const errorMsg: ChatMessage = {
					role: 'assistant',
					content: `Error: ${error}`
				};
				chatMessages = [...chatMessages, errorMsg];
				streamingContent = '';
				isStreaming = false;
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
		target.style.height = Math.min(target.scrollHeight, 120) + 'px';
	}

	function handleClose() {
		closeAIAssist();
		chatMessages = [];
		streamingContent = '';
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
</script>

<div
	class="w-[380px] border-l border-surface-600 bg-surface-800 flex flex-col shrink-0 overflow-hidden"
>
	<!-- Header -->
	<div
		class="flex items-center gap-2 px-3 py-2 border-b border-surface-600 shrink-0"
	>
		<span class="text-hecate-400">{'\u{2726}'}</span>
		<span class="text-xs font-semibold text-surface-100">AI</span>

		<!-- Model selector -->
		<ModelSelector
			currentModel={$aiModel}
			onSelect={(name) => setAIModelOverride(name)}
			showPhaseInfo={true}
			phasePreference={phasePref}
			phaseAffinity={currentAffinity}
			onPinModel={(name) => setPhaseModel($selectedPhase, name)}
			onClearPin={() => setPhaseModel($selectedPhase, null)}
			phaseName={PHASES.find((p) => p.code === $selectedPhase)?.shortName ?? ''}
		/>

		<div class="flex-1"></div>

		<span class="text-[9px] text-surface-400">
			{PHASES.find((p) => p.code === $selectedPhase)?.shortName ?? ''}
		</span>
		<button
			onclick={handleClose}
			class="text-surface-400 hover:text-surface-100 transition-colors px-1"
			title="Close AI Assistant"
		>
			{'\u{2715}'}
		</button>
	</div>

	<!-- Messages -->
	<div bind:this={messagesEl} class="flex-1 overflow-y-auto p-3 space-y-3">
		{#each chatMessages as msg}
			{#if msg.role === 'user'}
				<div class="flex justify-end">
					<div
						class="max-w-[85%] rounded-lg px-3 py-2 text-[11px]
						bg-hecate-600/20 text-surface-100 border border-hecate-600/20"
					>
						{msg.content}
					</div>
				</div>
			{:else if msg.role === 'assistant'}
				<div class="flex justify-start">
					<div
						class="max-w-[85%] rounded-lg px-3 py-2 text-[11px]
						bg-surface-700 text-surface-200 border border-surface-600
						{msg.content.startsWith('Error:') ? 'border-health-err/30 text-health-err' : ''}"
					>
						<div class="whitespace-pre-wrap break-words">{msg.content}</div>
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
					{#if streamingContent}
						<div class="whitespace-pre-wrap break-words">
							{streamingContent}<span
								class="inline-block w-1.5 h-3 bg-hecate-400 animate-pulse ml-0.5"
							></span>
						</div>
					{:else}
						<div class="flex items-center gap-1.5 text-surface-400">
							<span class="animate-bounce" style="animation-delay: 0ms"
								>.</span
							>
							<span class="animate-bounce" style="animation-delay: 150ms"
								>.</span
							>
							<span class="animate-bounce" style="animation-delay: 300ms"
								>.</span
							>
						</div>
					{/if}
				</div>
			</div>
		{/if}

		{#if chatMessages.length === 0 && !isStreaming}
			<div class="flex items-center justify-center h-full">
				<div class="text-center text-surface-400">
					<div class="text-xl mb-2">{'\u{2726}'}</div>
					<div class="text-[11px]">
						AI Assistant ready
						<br />
						{#if $aiModel}
							<span class="text-hecate-400">{$aiModel}</span>
							{#if currentAffinity === 'code'}
								<span class="text-[9px] text-phase-tni ml-1"
									>(code-optimized)</span
								>
							{/if}
						{:else}
							<span class="text-health-warn">No model available</span>
						{/if}
					</div>
				</div>
			</div>
		{/if}
	</div>

	<!-- Input -->
	<div class="border-t border-surface-600 p-2 shrink-0">
		<div class="flex gap-1.5">
			<textarea
				bind:this={inputEl}
				bind:value={inputValue}
				onkeydown={handleKeydown}
				oninput={autoResize}
				placeholder={isStreaming ? 'Waiting...' : 'Ask about this phase...'}
				disabled={isStreaming || !$aiModel}
				rows={1}
				class="flex-1 bg-surface-700 border border-surface-600 rounded px-2.5 py-1.5
					text-[11px] text-surface-100 placeholder-surface-400 resize-none
					focus:outline-none focus:border-hecate-500
					disabled:opacity-50 disabled:cursor-not-allowed"
			></textarea>
			<button
				onclick={() => sendMessage(inputValue)}
				disabled={isStreaming || !inputValue.trim() || !$aiModel}
				class="px-2.5 rounded text-[11px] transition-colors self-end
					{isStreaming || !inputValue.trim() || !$aiModel
					? 'bg-surface-600 text-surface-400 cursor-not-allowed'
					: 'bg-hecate-600 text-surface-50 hover:bg-hecate-500'}"
			>
				Send
			</button>
		</div>
	</div>
</div>
