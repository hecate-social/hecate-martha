import { writable } from 'svelte/store';

export const systemPrompt = writable<string>(
	'You are Martha, an AI assistant specializing in software architecture and domain-driven design.'
);
