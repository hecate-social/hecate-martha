import { writable, derived, get } from 'svelte/store';

// --- Types ---
export type PhaseCode = 'dna' | 'anp' | 'tni' | 'dno';

export interface PhaseInfo {
	code: PhaseCode;
	name: string;
	shortName: string;
	description: string;
	role: string;
	color: string;
}

// --- State ---
export const showAIAssist = writable(false);
export const aiAssistContext = writable<string>('');
export const aiAssistAgent = writable<string | null>(null);
export const aiModelOverride = writable<string | null>(null);
export const availableModels = writable<string[]>([]);

// --- Derived ---
export const aiModel = derived(
	[aiModelOverride, availableModels],
	([$override, $models]) => $override ?? $models[0] ?? null
);

// --- Phase Model Preferences ---
const PHASE_MODEL_PREFS_KEY = 'hecate-martha-phase-models';

type PhaseModelPrefs = Record<PhaseCode, string | null>;

function loadPhaseModelPrefs(): PhaseModelPrefs {
	try {
		const raw = localStorage.getItem(PHASE_MODEL_PREFS_KEY);
		if (raw) return JSON.parse(raw);
	} catch {
		// ignore
	}
	return { dna: null, anp: null, tni: null, dno: null };
}

function savePhaseModelPrefs(prefs: PhaseModelPrefs): void {
	try {
		localStorage.setItem(PHASE_MODEL_PREFS_KEY, JSON.stringify(prefs));
	} catch {
		// ignore
	}
}

export const phaseModelPrefs = writable<PhaseModelPrefs>(loadPhaseModelPrefs());

// --- Model Affinity ---
const CODE_PATTERNS = [
	/code/i, /coder/i, /codestral/i, /starcoder/i,
	/codellama/i, /wizard-?coder/i, /deepseek-coder/i
];

export function modelAffinity(name: string): 'code' | 'general' {
	if (CODE_PATTERNS.some((p) => p.test(name))) return 'code';
	return 'general';
}

export function phaseAffinity(phase: PhaseCode): 'code' | 'general' {
	return phase === 'tni' ? 'code' : 'general';
}

// --- Actions ---
export function openAIAssist(context: string, agentId?: string): void {
	aiAssistAgent.set(agentId ?? null);
	aiAssistContext.set(context);
	showAIAssist.set(true);
}

export function closeAIAssist(): void {
	showAIAssist.set(false);
	aiAssistAgent.set(null);
}

export function setAIModelOverride(model: string): void {
	aiModelOverride.set(model);
}

export function setPhaseModel(phase: PhaseCode, model: string | null): void {
	phaseModelPrefs.update((prefs) => {
		const updated = { ...prefs, [phase]: model };
		savePhaseModelPrefs(updated);
		return updated;
	});
}

export function parseAgentEvents(text: string): string[] {
	return text
		.split('\n')
		.map((line) => line.replace(/^[\s\-*\u2022\d.]+/, '').trim())
		.filter((line) => line.length > 0 && line.length < 80 && !line.includes(':'))
		.map((line) => line.replace(/["`]/g, ''));
}

// --- Phase Metadata ---
export const PHASES: PhaseInfo[] = [
	{
		code: 'dna',
		name: 'Discovery & Analysis',
		shortName: 'DnA',
		description: 'Understand the domain through event storming',
		role: 'dna',
		color: 'phase-dna'
	},
	{
		code: 'anp',
		name: 'Architecture & Planning',
		shortName: 'AnP',
		description: 'Plan desks, map dependencies, sequence work',
		role: 'anp',
		color: 'phase-anp'
	},
	{
		code: 'tni',
		name: 'Testing & Implementation',
		shortName: 'TnI',
		description: 'Generate code, run tests, validate criteria',
		role: 'tni',
		color: 'phase-tni'
	},
	{
		code: 'dno',
		name: 'Deployment & Operations',
		shortName: 'DnO',
		description: 'Deploy, monitor health, handle incidents',
		role: 'dno',
		color: 'phase-dno'
	}
];
