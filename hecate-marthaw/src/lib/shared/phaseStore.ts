import { writable, get } from 'svelte/store';
import { getApi } from './api.js';
import { activeVenture, divisions, fetchDivisions } from '../guide_venture/guide_venture.js';
import type { PhaseCode } from './aiStore.js';

// --- State ---
export const selectedPhase = writable<PhaseCode>('dna');
export const phaseError = writable<string | null>(null);
export const isLoading = writable(false);

// --- Actions ---
export async function startPhase(
	divisionId: string,
	phase: PhaseCode
): Promise<boolean> {
	try {
		isLoading.set(true);
		const api = getApi();
		await api.post(`/api/divisions/${divisionId}/phase/start`, { phase });
		const v = get(activeVenture);
		if (v) await fetchDivisions(v.venture_id);
		return true;
	} catch (e: unknown) {
		const err = e as { message?: string };
		phaseError.set(err.message || `Failed to start ${phase} phase`);
		return false;
	} finally {
		isLoading.set(false);
	}
}

export async function pausePhase(
	divisionId: string,
	phase: PhaseCode,
	reason?: string
): Promise<boolean> {
	try {
		isLoading.set(true);
		const api = getApi();
		await api.post(`/api/divisions/${divisionId}/phase/pause`, {
			phase,
			reason: reason || null
		});
		const v = get(activeVenture);
		if (v) await fetchDivisions(v.venture_id);
		return true;
	} catch (e: unknown) {
		const err = e as { message?: string };
		phaseError.set(err.message || `Failed to pause ${phase} phase`);
		return false;
	} finally {
		isLoading.set(false);
	}
}

export async function resumePhase(
	divisionId: string,
	phase: PhaseCode
): Promise<boolean> {
	try {
		isLoading.set(true);
		const api = getApi();
		await api.post(`/api/divisions/${divisionId}/phase/resume`, { phase });
		const v = get(activeVenture);
		if (v) await fetchDivisions(v.venture_id);
		return true;
	} catch (e: unknown) {
		const err = e as { message?: string };
		phaseError.set(err.message || `Failed to resume ${phase} phase`);
		return false;
	} finally {
		isLoading.set(false);
	}
}

export async function completePhase(
	divisionId: string,
	phase: PhaseCode
): Promise<boolean> {
	try {
		isLoading.set(true);
		const api = getApi();
		await api.post(`/api/divisions/${divisionId}/phase/complete`, { phase });
		const v = get(activeVenture);
		if (v) await fetchDivisions(v.venture_id);
		return true;
	} catch (e: unknown) {
		const err = e as { message?: string };
		phaseError.set(err.message || `Failed to complete ${phase} phase`);
		return false;
	} finally {
		isLoading.set(false);
	}
}
