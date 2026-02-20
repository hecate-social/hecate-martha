<script lang="ts">
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
</script>

<button
	class="text-[10px] px-2 py-0.5 rounded bg-surface-700 text-surface-300
		hover:bg-surface-600 transition-colors truncate max-w-[120px]"
	title={currentModel ?? 'No model selected'}
>
	{currentModel ?? 'No model'}
</button>
