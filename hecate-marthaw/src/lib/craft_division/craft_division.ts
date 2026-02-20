import { writable } from 'svelte/store';
import { getApi } from '../shared/api.js';

// --- State ---
export const craftError = writable<string | null>(null);

// --- Actions ---
export async function generateModule(
	divisionId: string,
	data: { module_name: string; template?: string }
): Promise<boolean> {
	try {
		const api = getApi();
		await api.post(`/api/divisions/${divisionId}/generate/modules`, data);
		return true;
	} catch (e: unknown) {
		const err = e as { message?: string };
		craftError.set(err.message || 'Failed to generate module');
		return false;
	}
}

export async function generateTests(
	divisionId: string,
	data: { test_module: string; target_module: string }
): Promise<boolean> {
	try {
		const api = getApi();
		await api.post(`/api/divisions/${divisionId}/generate/tests`, data);
		return true;
	} catch (e: unknown) {
		const err = e as { message?: string };
		craftError.set(err.message || 'Failed to generate tests');
		return false;
	}
}
