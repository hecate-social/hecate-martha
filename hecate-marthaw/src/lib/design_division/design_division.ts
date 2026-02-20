import { writable, derived } from 'svelte/store';
import { getApi } from '../shared/api.js';

// --- Types ---
export type ExecutionMode = 'human' | 'agent' | 'both' | 'pair';

export interface PolicyNote {
	id: string;
	text: string;
}

export interface EventNote {
	id: string;
	text: string;
}

export interface DeskCard {
	id: string;
	name: string;
	aggregate?: string;
	execution: ExecutionMode;
	policies: PolicyNote[];
	events: EventNote[];
}

// --- State ---
export const deskCards = writable<DeskCard[]>([]);
export const designError = writable<string | null>(null);

// --- Derived ---
export const deskAggregates = derived(deskCards, ($cards) => {
	const aggs = new Set<string>();
	for (const c of $cards) {
		if (c.aggregate) aggs.add(c.aggregate);
	}
	return Array.from(aggs).sort();
});

export const deskCardsByAggregate = derived(deskCards, ($cards) => {
	const grouped = new Map<string, DeskCard[]>();
	const ungrouped: DeskCard[] = [];

	for (const c of $cards) {
		if (c.aggregate) {
			const list = grouped.get(c.aggregate) || [];
			list.push(c);
			grouped.set(c.aggregate, list);
		} else {
			ungrouped.push(c);
		}
	}

	return { grouped, ungrouped };
});

// --- Card Actions ---
export function addDeskCard(
	name: string,
	aggregate?: string,
	execution: ExecutionMode = 'human'
): string {
	const id = crypto.randomUUID();
	const card: DeskCard = {
		id,
		name: name.trim(),
		aggregate: aggregate?.trim() || undefined,
		execution,
		policies: [],
		events: []
	};
	deskCards.update((cards) => [...cards, card]);
	return id;
}

export function removeDeskCard(cardId: string): void {
	deskCards.update((cards) => cards.filter((c) => c.id !== cardId));
}

export function updateDeskCard(
	cardId: string,
	updates: Partial<Pick<DeskCard, 'name' | 'aggregate' | 'execution'>>
): void {
	deskCards.update((cards) =>
		cards.map((c) => (c.id === cardId ? { ...c, ...updates } : c))
	);
}

export function setDeskExecution(cardId: string, mode: ExecutionMode): void {
	deskCards.update((cards) =>
		cards.map((c) => (c.id === cardId ? { ...c, execution: mode } : c))
	);
}

export function addPolicyToDesk(cardId: string, text: string): void {
	const policy: PolicyNote = { id: crypto.randomUUID(), text: text.trim() };
	deskCards.update((cards) =>
		cards.map((c) =>
			c.id === cardId
				? { ...c, policies: [...c.policies, policy] }
				: c
		)
	);
}

export function removePolicyFromDesk(cardId: string, policyId: string): void {
	deskCards.update((cards) =>
		cards.map((c) =>
			c.id === cardId
				? { ...c, policies: c.policies.filter((p) => p.id !== policyId) }
				: c
		)
	);
}

export function addEventToDesk(cardId: string, text: string): void {
	const event: EventNote = { id: crypto.randomUUID(), text: text.trim() };
	deskCards.update((cards) =>
		cards.map((c) =>
			c.id === cardId
				? { ...c, events: [...c.events, event] }
				: c
		)
	);
}

export function removeEventFromDesk(cardId: string, eventId: string): void {
	deskCards.update((cards) =>
		cards.map((c) =>
			c.id === cardId
				? { ...c, events: c.events.filter((e) => e.id !== eventId) }
				: c
		)
	);
}

export function resetDeskCards(): void {
	deskCards.set([]);
}

// --- Server Actions ---
export async function designAggregate(
	divisionId: string,
	data: { aggregate_name: string; description?: string }
): Promise<boolean> {
	try {
		const api = getApi();
		await api.post(`/api/divisions/${divisionId}/design/aggregates`, data);
		return true;
	} catch (e: unknown) {
		const err = e as { message?: string };
		designError.set(err.message || 'Failed to design aggregate');
		return false;
	}
}

export async function designEvent(
	divisionId: string,
	data: { event_name: string; aggregate_type: string; description?: string }
): Promise<boolean> {
	try {
		const api = getApi();
		await api.post(`/api/divisions/${divisionId}/design/events`, data);
		return true;
	} catch (e: unknown) {
		const err = e as { message?: string };
		designError.set(err.message || 'Failed to design event');
		return false;
	}
}
