/**
 * useSSE.js — Hook for invoking AI with SSE streaming
 */
import { useCallback } from 'react';
import useAppStore from '../store/useAppStore';
import { invokeAI } from '../services/aiApi';
import { listFiles, readFile } from '../services/agentApi';

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
        onComplete: async (result) => {
          const summary =
            typeof result === 'string'
              ? result
              : Array.isArray(result)
              ? `Completed ${result.length} action(s)`
              : 'Task completed successfully.';
          finishAIResponse(summary);

          // Wait 1s for agent to finish writing files before refreshing
          await new Promise(r => setTimeout(r, 1000));

          // Refresh file tree after AI completes
          try {
            const newFiles = await listFiles(sandboxId);
            if (newFiles && newFiles.length > 0) {
              useAppStore.getState().setFiles(newFiles);
            }

            // Also refresh all currently open tabs so editor shows updated content
            const { openTabs, updateTabContent, setTabError } = useAppStore.getState();
            await Promise.allSettled(
              openTabs.map(async (tab) => {
                try {
                  const content = await readFile(sandboxId, tab.path);
                  updateTabContent(tab.path, content);
                } catch (err) {
                  setTabError(tab.path, `Could not refresh: ${err.message}`);
                }
              })
            );
          } catch (err) {
            console.error('Failed to refresh after AI:', err);
            addToast('Files could not refresh — click 🔄 to refresh manually', 'error');
          }
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
