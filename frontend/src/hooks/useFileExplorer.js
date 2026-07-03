/**
 * useFileExplorer.js — File tree loading and tab management hook
 */
import { useCallback } from 'react';
import useAppStore from '../store/useAppStore';
import { listFiles, readFile } from '../services/agentApi';

export function useFileExplorer() {
  const {
    sandboxId,
    setFiles,
    openTab,
    updateTabContent,
    setTabLoading,
    setTabError,
    addToast,
  } = useAppStore();

  /** Fetch the full file list from the agent */
  const loadFiles = useCallback(async () => {
    if (!sandboxId) return;
    try {
      const files = await listFiles(sandboxId);
      setFiles(files);
    } catch (err) {
      addToast(`Failed to load files: ${err.message}`, 'error');
    }
  }, [sandboxId, setFiles, addToast]);

  /** Open a file in a tab and load its content */
  const openFile = useCallback(
    async (filePath) => {
      if (!sandboxId) return;

      // Open tab immediately (shows loading state)
      openTab(filePath, '', true);
      setTabLoading(filePath, true);

      try {
        const content = await readFile(sandboxId, filePath);
        updateTabContent(filePath, content);
      } catch (err) {
        setTabError(filePath, `Could not load: ${err.message}`);
        addToast(`Error loading ${filePath}`, 'error');
      }
    },
    [sandboxId, openTab, updateTabContent, setTabLoading, setTabError, addToast]
  );

  /** Refresh a single already-open tab */
  const refreshTab = useCallback(
    async (filePath) => {
      if (!sandboxId) return;
      setTabLoading(filePath, true);
      try {
        const content = await readFile(sandboxId, filePath);
        updateTabContent(filePath, content);
      } catch (err) {
        setTabError(filePath, err.message);
      }
    },
    [sandboxId, updateTabContent, setTabLoading, setTabError]
  );

  return { loadFiles, openFile, refreshTab };
}
