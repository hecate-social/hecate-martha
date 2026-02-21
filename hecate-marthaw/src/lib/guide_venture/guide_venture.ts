import { writable, derived } from 'svelte/store';
import { getApi } from '../shared/api.js';
import { hasFlag, VL_DISCOVERING, VL_DISCOVERY_PAUSED, VL_ARCHIVED } from '../types.js';
import type { Venture, Division } from '../types.js';

// --- State ---
export const ventures = writable<Venture[]>([]);
export const activeVenture = writable<Venture | null>(null);
export const divisions = writable<Division[]>([]);
export const selectedDivisionId = writable<string | null>(null);
export const isLoading = writable(false);
export const ventureError = writable<string | null>(null);

// --- Derived ---
export const selectedDivision = derived(
	[divisions, selectedDivisionId],
	([$divisions, $id]) => $divisions.find((d) => d.division_id === $id) ?? null
);

/** Derives a human-readable step name from the active venture's status + phase. */
export const ventureStep = derived(
	activeVenture,
	($v) => {
		if (!$v) return 'none';
		if (hasFlag($v.status, VL_ARCHIVED)) return 'archived';
		if (hasFlag($v.status, VL_DISCOVERY_PAUSED)) return 'discovery_paused';
		if (hasFlag($v.status, VL_DISCOVERING)) return 'discovering';
		// Fall back to phase string from the server
		return $v.phase || 'initiated';
	}
);

// --- Venture selection ---
export function selectVenture(venture: Venture): void {
	activeVenture.set(venture);
}

export function clearActiveVenture(): void {
	activeVenture.set(null);
}

// --- Actions ---
export async function fetchVentures(): Promise<void> {
	try {
		const api = getApi();
		const resp = await api.get<{ ventures: Venture[] }>('/api/ventures');
		ventures.set(resp.ventures);
	} catch {
		ventures.set([]);
	}
}

export async function fetchActiveVenture(): Promise<void> {
	try {
		const api = getApi();
		const resp = await api.get<{ venture: Venture }>('/api/ventures/active');
		activeVenture.set(resp.venture);
	} catch {
		activeVenture.set(null);
	}
}

export async function fetchDivisions(ventureId: string): Promise<void> {
	try {
		const api = getApi();
		const resp = await api.get<{ divisions: Division[] }>(
			`/api/ventures/${ventureId}/divisions`
		);
		divisions.set(resp.divisions);
	} catch {
		divisions.set([]);
	}
}

export async function initiateVenture(name: string, brief: string): Promise<boolean> {
	try {
		isLoading.set(true);
		const api = getApi();
		await api.post('/api/ventures/initiate', { name, brief, initiated_by: 'hecate-web' });
		await fetchVentures();
		await fetchActiveVenture();
		return true;
	} catch (e: unknown) {
		const err = e as { message?: string };
		ventureError.set(err.message || 'Failed to initiate venture');
		return false;
	} finally {
		isLoading.set(false);
	}
}

export async function archiveVenture(ventureId: string): Promise<boolean> {
	try {
		isLoading.set(true);
		const api = getApi();
		await api.post(`/api/ventures/${ventureId}/archive`, {});
		await fetchVentures();
		await fetchActiveVenture();
		return true;
	} catch (e: unknown) {
		const err = e as { message?: string };
		ventureError.set(err.message || 'Failed to archive venture');
		return false;
	} finally {
		isLoading.set(false);
	}
}

export async function scaffoldVentureRepo(
	ventureId: string,
	repoPath: string,
	vision?: string,
	name?: string,
	brief?: string
): Promise<boolean> {
	try {
		isLoading.set(true);
		const api = getApi();
		await api.post(`/api/ventures/${ventureId}/repo`, {
			repo_url: repoPath,
			vision: vision || undefined,
			name: name || undefined,
			brief: brief || undefined
		});
		await fetchActiveVenture();
		return true;
	} catch (e: unknown) {
		const err = e as { message?: string };
		ventureError.set(err.message || 'Failed to scaffold venture repo');
		return false;
	} finally {
		isLoading.set(false);
	}
}

export async function startDiscovery(ventureId: string): Promise<boolean> {
	try {
		isLoading.set(true);
		const api = getApi();
		await api.post(`/api/ventures/${ventureId}/discovery/start`, {});
		await fetchActiveVenture();
		return true;
	} catch (e: unknown) {
		const err = e as { message?: string };
		ventureError.set(err.message || 'Failed to start discovery');
		return false;
	} finally {
		isLoading.set(false);
	}
}

export async function identifyDivision(
	ventureId: string,
	contextName: string,
	description?: string
): Promise<boolean> {
	try {
		isLoading.set(true);
		const api = getApi();
		await api.post(`/api/ventures/${ventureId}/discovery/identify`, {
			context_name: contextName,
			description: description || null,
			identified_by: 'hecate-web'
		});
		await fetchDivisions(ventureId);
		return true;
	} catch (e: unknown) {
		const err = e as { message?: string };
		ventureError.set(err.message || 'Failed to identify division');
		return false;
	} finally {
		isLoading.set(false);
	}
}

export async function pauseDiscovery(
	ventureId: string,
	reason?: string
): Promise<boolean> {
	try {
		isLoading.set(true);
		const api = getApi();
		await api.post(`/api/ventures/${ventureId}/discovery/pause`, {
			reason: reason || null
		});
		await fetchActiveVenture();
		return true;
	} catch (e: unknown) {
		const err = e as { message?: string };
		ventureError.set(err.message || 'Failed to pause discovery');
		return false;
	} finally {
		isLoading.set(false);
	}
}

export async function resumeDiscovery(ventureId: string): Promise<boolean> {
	try {
		isLoading.set(true);
		const api = getApi();
		await api.post(`/api/ventures/${ventureId}/discovery/resume`, {});
		await fetchActiveVenture();
		return true;
	} catch (e: unknown) {
		const err = e as { message?: string };
		ventureError.set(err.message || 'Failed to resume discovery');
		return false;
	} finally {
		isLoading.set(false);
	}
}

export async function completeDiscovery(ventureId: string): Promise<boolean> {
	try {
		isLoading.set(true);
		const api = getApi();
		await api.post(`/api/ventures/${ventureId}/discovery/complete`, {});
		await fetchActiveVenture();
		return true;
	} catch (e: unknown) {
		const err = e as { message?: string };
		ventureError.set(err.message || 'Failed to complete discovery');
		return false;
	} finally {
		isLoading.set(false);
	}
}
