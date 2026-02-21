import type { ChatMessage, StreamChunk } from '../types.js';

/** Base URL for the hecate-daemon custom protocol (LLM lives on daemon, not plugin) */
const DAEMON_BASE = 'hecate://localhost';

export interface ChatStream {
	onChunk: (handler: (chunk: StreamChunk) => void) => ChatStream;
	onDone: (handler: (chunk: StreamChunk) => void) => ChatStream;
	onError: (handler: (error: string) => void) => ChatStream;
	start: () => Promise<void>;
	cancel: () => void;
}

export interface StudioContext {
	stream: {
		chat: (model: string, messages: ChatMessage[]) => ChatStream;
	};
}

/** Fetch available LLM models from hecate-daemon directly. */
export async function fetchModels(): Promise<string[]> {
	try {
		const resp = await fetch(`${DAEMON_BASE}/api/llm/models`);
		if (!resp.ok) return [];
		const data = await resp.json();
		if (data.ok && Array.isArray(data.models)) {
			return data.models.map((m: { name: string }) => m.name);
		}
		return [];
	} catch {
		return [];
	}
}

function createChatStream(model: string, messages: ChatMessage[]): ChatStream {
	let chunkHandler: ((chunk: StreamChunk) => void) | null = null;
	let doneHandler: ((chunk: StreamChunk) => void) | null = null;
	let errorHandler: ((error: string) => void) | null = null;
	let cancelled = false;

	const stream: ChatStream = {
		onChunk(handler) {
			chunkHandler = handler;
			return stream;
		},
		onDone(handler) {
			doneHandler = handler;
			return stream;
		},
		onError(handler) {
			errorHandler = handler;
			return stream;
		},
		async start() {
			if (cancelled) return;
			try {
				const resp = await fetch(`${DAEMON_BASE}/api/llm/chat`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ model, messages })
				});
				if (cancelled) return;
				if (!resp.ok) {
					const text = await resp.text().catch(() => resp.statusText);
					if (errorHandler) errorHandler(text || 'LLM request failed');
					return;
				}
				const data = await resp.json();
				if (chunkHandler) chunkHandler({ content: data.content });
				if (doneHandler) doneHandler({ content: '', done: true });
			} catch (e: unknown) {
				if (cancelled) return;
				const err = e as { message?: string };
				if (errorHandler) errorHandler(err.message || 'LLM request failed');
			}
		},
		cancel() {
			cancelled = true;
		}
	};

	return stream;
}

export function createStudioContext(): StudioContext {
	return {
		stream: {
			chat: createChatStream
		}
	};
}
