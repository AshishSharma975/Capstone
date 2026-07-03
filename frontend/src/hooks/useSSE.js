/**
 * useSSE.js — Hook for invoking AI with SSE streaming
 */
import { useCallback } from 'react';
import useAppStore from '../store/useAppStore';
import { invokeAI } from '../services/aiApi';

export function useSSE() {
  const {
    addUserMessage,
    startAIResponse,
    addSSEStep,
    finishAIResponse,
    cancelAI,
    addToast,
    sandboxId,
  } = useAppStore();

  const sendMessage = useCallback(
    async (message) => {
      if (!sandboxId) {
        addToast('No active sandbox', 'error');
        return;
      }

      addUserMessage(message);

      const abortController = new AbortController();
      startAIResponse(abortController);

      await invokeAI({
        message,
        projectId: sandboxId,
        abortController,
        onStart: (event) => {
          addSSEStep({ type: 'start', message: event.message || 'Agent started...' });
        },
        onStep: (event) => {
          addSSEStep({ type: 'step', message: event.message || JSON.stringify(event) });
        },
        onComplete: (result) => {
          const summary =
            typeof result === 'string'
              ? result
              : Array.isArray(result)
              ? `Completed ${result.length} action(s)`
              : 'Task completed successfully.';
          finishAIResponse(summary);
        },
        onError: (err) => {
          addSSEStep({ type: 'error', message: err.message });
          finishAIResponse(`Error: ${err.message}`);
          addToast(`AI error: ${err.message}`, 'error');
        },
      });
    },
    [sandboxId, addUserMessage, startAIResponse, addSSEStep, finishAIResponse, addToast]
  );

  return { sendMessage, cancelAI };
}
