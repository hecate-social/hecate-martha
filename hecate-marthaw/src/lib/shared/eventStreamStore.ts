import { writable } from 'svelte/store';

export interface RawEvent {
	event_id: string;
	event_type: string;
	stream_id: string;
	version: number;
	timestamp: string;
	data: Record<string, unknown>;
}

export const showEventStream = writable<boolean>(false);
export const eventStreamEvents = writable<RawEvent[]>([]);

export function toggleEventStream(): void {
	showEventStream.update((v) => !v);
}
