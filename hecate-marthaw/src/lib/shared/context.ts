import { getApi } from './api.js';
import type { ChatMessage, StreamChunk } from '../types.js';

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
				const api = getApi();
				const resp = await api.post<{ content: string }>('/api/llm/chat', {
					model,
					messages
				});
				if (cancelled) return;
				if (chunkHandler) chunkHandler({ content: resp.content });
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
