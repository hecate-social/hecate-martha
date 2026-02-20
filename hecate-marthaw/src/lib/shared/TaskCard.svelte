<script lang="ts">
	import { openAIAssist } from '$lib/shared/aiStore.js';

	interface Props {
		title: string;
		description: string;
		icon?: string;
		status?: 'pending' | 'active' | 'done';
		aiContext?: string;
		onaction?: () => void;
		actionLabel?: string;
		disabled?: boolean;
	}

	let {
		title,
		description,
		icon = '\u{25A0}',
		status = 'pending',
		aiContext,
		onaction,
		actionLabel = 'Execute',
		disabled = false
	}: Props = $props();

	let badge = $derived(statusBadge(status));

	function statusColor(s: string): string {
		switch (s) {
			case 'active':
				return 'border-hecate-600/40';
			case 'done':
				return 'border-health-ok/30';
			default:
				return 'border-surface-600';
		}
	}

	function statusBadge(s: string): { text: string; cls: string } {
		switch (s) {
			case 'active':
				return {
					text: 'Active',
					cls: 'bg-hecate-600/20 text-hecate-300'
				};
			case 'done':
				return {
					text: 'Done',
					cls: 'bg-health-ok/10 text-health-ok'
				};
			default:
				return {
					text: 'Pending',
					cls: 'bg-surface-700 text-surface-400'
				};
		}
	}
</script>

<div
	class="rounded-lg bg-surface-800 border {statusColor(
		status
	)} p-4 flex flex-col gap-2 transition-colors hover:border-surface-500"
>
	<div class="flex items-start gap-2">
		<span class="text-hecate-400 text-sm mt-0.5">{icon}</span>
		<div class="flex-1 min-w-0">
			<div class="flex items-center gap-2">
				<h3 class="text-xs font-semibold text-surface-100">{title}</h3>
				<span class="text-[9px] px-1.5 py-0.5 rounded {badge.cls}">
					{badge.text}
				</span>
			</div>
			<p class="text-[11px] text-surface-400 mt-1">{description}</p>
		</div>
	</div>

	<div class="flex items-center gap-2 mt-1">
		{#if onaction}
			<button
				onclick={onaction}
				{disabled}
				class="text-[10px] px-2.5 py-1 rounded bg-hecate-600/20 text-hecate-300
					hover:bg-hecate-600/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
			>
				{actionLabel}
			</button>
		{/if}

		{#if aiContext}
			<button
				onclick={() => openAIAssist(aiContext)}
				class="text-[10px] px-2 py-1 rounded text-surface-400
					hover:text-hecate-300 hover:bg-hecate-600/10 transition-colors"
				title="Get AI assistance"
			>
				{'\u{2726}'} AI
			</button>
		{/if}
	</div>
</div>
