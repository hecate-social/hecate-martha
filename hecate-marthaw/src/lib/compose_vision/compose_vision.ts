import { writable } from 'svelte/store';
import { getApi } from '../shared/api.js';
import { fetchActiveVenture } from '../guide_venture/guide_venture.js';

// --- State ---
export const visionDraft = writable<string>('');
export const isRefining = writable(false);
export const refinementResult = writable<string | null>(null);
export const visionError = writable<string | null>(null);

// --- Actions ---
export async function submitVision(ventureId: string, vision: string): Promise<boolean> {
	try {
		const api = getApi();
		await api.post(`/api/ventures/${ventureId}/vision`, { vision });
		await fetchActiveVenture();
		return true;
	} catch (e: unknown) {
		const err = e as { message?: string };
		visionError.set(err.message || 'Failed to submit vision');
		return false;
	}
}

export async function refineVision(ventureId: string, vision: string): Promise<boolean> {
	try {
		isRefining.set(true);
		const api = getApi();
		const resp = await api.post<{ refined: string }>(
			`/api/ventures/${ventureId}/vision/refine`,
			{ vision }
		);
		refinementResult.set(resp.refined);
		await fetchActiveVenture();
		return true;
	} catch (e: unknown) {
		const err = e as { message?: string };
		visionError.set(err.message || 'Failed to refine vision');
		return false;
	} finally {
		isRefining.set(false);
	}
}
