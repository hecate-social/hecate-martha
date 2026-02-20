import { writable } from 'svelte/store';
import { getApi } from '../shared/api.js';

// --- State ---
export const planError = writable<string | null>(null);

// --- Actions ---
export async function planDesk(
	divisionId: string,
	data: { desk_name: string; description?: string; department?: string }
): Promise<boolean> {
	try {
		const api = getApi();
		await api.post(`/api/divisions/${divisionId}/plan/desks`, data);
		return true;
	} catch (e: unknown) {
		const err = e as { message?: string };
		planError.set(err.message || 'Failed to plan desk');
		return false;
	}
}
