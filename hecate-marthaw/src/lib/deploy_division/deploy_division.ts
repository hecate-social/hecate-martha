import { writable } from 'svelte/store';
import { getApi } from '../shared/api.js';

// --- State ---
export const deployError = writable<string | null>(null);

// --- Actions ---
export async function deployRelease(
	divisionId: string,
	version: string
): Promise<boolean> {
	try {
		const api = getApi();
		await api.post(`/api/divisions/${divisionId}/deploy/releases`, { version });
		return true;
	} catch (e: unknown) {
		const err = e as { message?: string };
		deployError.set(err.message || 'Failed to deploy release');
		return false;
	}
}

export async function raiseIncident(
	divisionId: string,
	data: { incident_title: string; severity: string; description?: string }
): Promise<boolean> {
	try {
		const api = getApi();
		await api.post(`/api/divisions/${divisionId}/rescue/incidents`, data);
		return true;
	} catch (e: unknown) {
		const err = e as { message?: string };
		deployError.set(err.message || 'Failed to raise incident');
		return false;
	}
}
