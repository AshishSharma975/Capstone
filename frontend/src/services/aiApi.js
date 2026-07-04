/**
 * aiApi.js — AI invocation via Server-Sent Events (SSE)
 *
 * Uses fetch + ReadableStream because the endpoint requires POST,
 * and the native EventSource only supports GET.
 */

const AI_BASE_URL = '/api/ai/invoke';

/**
 * Invoke the AI agent with streaming SSE response.
 *
 * @param {object} params
 * @param {string} params.message - User prompt
 * @param {string} params.projectId - Sandbox ID
 * @param {AbortController} params.abortController - For cancellation
 * @param {(msg: object) => void} params.onStart - Called on "start" event
 * @param {(step: object) => void} params.onStep - Called on each "step" event
 * @param {(result: any) => void} params.onComplete - Called on "complete" event
 * @param {(error: Error) => void} params.onError - Called on error
 */
export async function invokeAI({
  message,
  projectId,
  abortController,
  onStart,
  onStep,
  onComplete,
  onError,
}) {
  try {
    const response = await fetch(AI_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
      },
      body: JSON.stringify({ message, projectId }),
      signal: abortController?.signal,
    });

    if (!response.ok) {
      throw new Error(`AI request failed: ${response.status} ${response.statusText}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    // Read the stream chunk by chunk
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // SSE messages are separated by double newlines
      const parts = buffer.split('\n\n');
      // Keep last incomplete chunk in buffer
      buffer = parts.pop();

      for (const part of parts) {
        // Each part may have multiple "data:" lines
        const lines = part.split('\n').filter((l) => l.startsWith('data:'));
        for (const line of lines) {
          const jsonStr = line.slice(5).trim(); // remove "data:" prefix
          if (!jsonStr || jsonStr === '[DONE]') continue;

          try {
            const event = JSON.parse(jsonStr);
            handleSSEEvent(event, { onStart, onStep, onComplete, onError });
          } catch {
            // Ignore malformed JSON chunks
          }
        }
      }
    }

    // Process any remaining buffer
    if (buffer.trim()) {
      const lines = buffer.split('\n').filter((l) => l.startsWith('data:'));
      for (const line of lines) {
        const jsonStr = line.slice(5).trim();
        if (!jsonStr || jsonStr === '[DONE]') continue;
        try {
          const event = JSON.parse(jsonStr);
          handleSSEEvent(event, { onStart, onStep, onComplete, onError });
        } catch {
          // ignore
        }
      }
    }
  } catch (err) {
    if (err.name === 'AbortError') return; // User cancelled — not an error
    onError?.(err);
  }
}

/**
 * Route a parsed SSE event to the correct callback.
 * @param {object} event
 * @param {object} callbacks
 */
function handleSSEEvent(event, { onStart, onStep, onComplete, onError }) {
  switch (event.type) {
    case 'start':
      onStart?.(event);
      break;
    case 'step':
      onStep?.(event);
      break;
    case 'complete':
      onComplete?.(event.result ?? event);
      break;
    case 'error':
      if (onError) onError(new Error(event.message));
      break;
    case 'ping':
      // Just keep-alive, ignore
      break;
    default:
      // Unknown event type — treat as step
      onStep?.(event);
  }
}
