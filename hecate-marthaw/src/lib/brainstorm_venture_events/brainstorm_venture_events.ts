import { writable } from 'svelte/store';

// --- Types ---
export type StickyNoteType = 'domain_event' | 'command' | 'aggregate' | 'policy' | 'read_model' | 'external_system';

export interface StickyNote {
	id: string;
	type: StickyNoteType;
	text: string;
	author: string;
	aggregate_group?: string;
	created_at: number;
}

// --- State ---
export const stickyNotes = writable<StickyNote[]>([]);

// --- Actions ---
export function addStickyNote(
	type: StickyNoteType,
	text: string,
	author = 'user'
): void {
	const note: StickyNote = {
		id: crypto.randomUUID(),
		type,
		text,
		author,
		created_at: Date.now()
	};
	stickyNotes.update((notes) => [...notes, note]);
}

export function removeStickyNote(noteId: string): void {
	stickyNotes.update((notes) => notes.filter((n) => n.id !== noteId));
}

export function updateStickyNote(noteId: string, text: string): void {
	stickyNotes.update((notes) =>
		notes.map((n) => (n.id === noteId ? { ...n, text } : n))
	);
}

export function groupStickyNote(
	noteId: string,
	aggregateGroup: string
): void {
	stickyNotes.update((notes) =>
		notes.map((n) =>
			n.id === noteId ? { ...n, aggregate_group: aggregateGroup } : n
		)
	);
}
