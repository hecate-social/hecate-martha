import { writable } from 'svelte/store';
import { getApi } from './api.js';

export interface AgentPrompt {
	id: string;
	name: string;
	role: string;
	icon: string;
	description: string;
	prompt: string;
}

// --- Fallback Constants ---

const FALLBACK_VISION_ORACLE = `You are The Oracle, a vision architect. You interview the user about their venture and build a vision document.

RULES:
1. Ask ONE question per response. Keep it short (2-3 sentences + question).
2. After EVERY response, include a vision draft inside a \`\`\`markdown code fence.
3. Cover 5 topics: Problem, Users, Capabilities, Constraints, Success Criteria.

Be warm but direct. Push for specifics when answers are vague.`;

const FALLBACK_ASSIST_GENERAL =
	'Be concise and practical. Suggest specific, actionable items. When suggesting domain elements, use snake_case naming. When suggesting events, use the format: {subject}_{verb_past}_v{N}.';

const FALLBACK_BIG_PICTURE: AgentPrompt[] = [
	{
		id: 'oracle',
		name: 'The Oracle',
		role: 'Domain Expert',
		icon: '\u{25C7}',
		description: 'Rapid-fires domain events from the vision document',
		prompt: 'You are The Oracle, a domain expert participating in a Big Picture Event Storming session. Your job is to rapidly identify domain events. Output ONLY event names in past tense business language. One per line. Be fast, be prolific.'
	},
	{
		id: 'architect',
		name: 'The Architect',
		role: 'Boundary Spotter',
		icon: '\u{25B3}',
		description: 'Identifies natural context boundaries between event clusters',
		prompt: 'You are The Architect, a DDD strategist. Given the events on the board, identify BOUNDED CONTEXT BOUNDARIES. Name the candidate contexts (divisions) and list which events belong to each.'
	},
	{
		id: 'advocate',
		name: 'The Advocate',
		role: "Devil's Advocate",
		icon: '\u{2605}',
		description: 'Challenges context boundaries and finds missing events',
		prompt: "You are The Advocate. Identify MISSING events and challenge proposed boundaries. Be specific and constructive."
	},
	{
		id: 'scribe',
		name: 'The Scribe',
		role: 'Integration Mapper',
		icon: '\u{25A1}',
		description: 'Maps how contexts communicate via integration facts',
		prompt: 'You are The Scribe. Map INTEGRATION FACTS between contexts. Use: "Context A publishes fact_name -> Context B".'
	}
];

const FALLBACK_DESIGN_LEVEL: AgentPrompt[] = [
	{
		id: 'oracle',
		name: 'The Oracle',
		role: 'Domain Expert',
		icon: '\u{25C7}',
		description: 'Identifies domain events and business processes',
		prompt: 'You are The Oracle for Design-Level Event Storming. Identify business events in past tense snake_case_v1 format with one-line rationale each.'
	},
	{
		id: 'architect',
		name: 'The Architect',
		role: 'Technical Lead',
		icon: '\u{25B3}',
		description: 'Identifies aggregates and structural patterns',
		prompt: 'You are The Architect for Design-Level Event Storming. Identify aggregate boundaries and explain which events cluster around them.'
	},
	{
		id: 'advocate',
		name: 'The Advocate',
		role: "Devil's Advocate",
		icon: '\u{2605}',
		description: 'Questions assumptions and identifies edge cases',
		prompt: "You are The Advocate. Find problems, edge cases, and hotspots. Challenge every assumption."
	},
	{
		id: 'scribe',
		name: 'The Scribe',
		role: 'Process Analyst',
		icon: '\u{25A1}',
		description: 'Organizes discoveries and identifies read models',
		prompt: 'You are The Scribe. Identify read models and policies. Focus on queryable information and domain rules.'
	}
];

// --- Stores ---
export const bigPictureAgents = writable<AgentPrompt[]>(FALLBACK_BIG_PICTURE);
export const designLevelAgents = writable<AgentPrompt[]>(FALLBACK_DESIGN_LEVEL);
export const visionOraclePrompt = writable<string>(FALLBACK_VISION_ORACLE);
export const assistGeneralPrompt = writable<string>(FALLBACK_ASSIST_GENERAL);

// --- Loading (via plugin API instead of Tauri invoke) ---
export async function loadAgents(): Promise<void> {
	try {
		const api = getApi();
		const resp = await api.get<{
			big_picture?: AgentPrompt[];
			design_level?: AgentPrompt[];
			vision_oracle?: string;
			assist_general?: string;
		}>('/api/agents');

		if (resp.big_picture) bigPictureAgents.set(resp.big_picture);
		if (resp.design_level) designLevelAgents.set(resp.design_level);
		if (resp.vision_oracle) visionOraclePrompt.set(resp.vision_oracle);
		if (resp.assist_general) assistGeneralPrompt.set(resp.assist_general);
	} catch {
		console.warn('[agents] Could not load agent prompts, using fallback defaults');
	}
}

// --- Template variable substitution ---
export function applyVariables(prompt: string, vars: Record<string, string>): string {
	return prompt.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`);
}
