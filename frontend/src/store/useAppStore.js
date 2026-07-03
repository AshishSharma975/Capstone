/**
 * useAppStore.js — Global Zustand store
 * Manages all application state: sandbox, files, tabs, chat, SSE, terminal
 */
import { create } from 'zustand';

const useAppStore = create((set, get) => ({
  // ─── Sandbox ─────────────────────────────────────────────
  sandboxId: null,
  previewUrl: null,
  setSandbox: (sandboxId, previewUrl) => set({ sandboxId, previewUrl }),

  // ─── File Explorer ────────────────────────────────────────
  files: [],          // flat list of file paths
  setFiles: (files) => set({ files }),

  // ─── Tabs / Editor ───────────────────────────────────────
  openTabs: [],       // [{ path, content, loading, error }]
  activeTabPath: null,

  openTab: (path, content = '', loading = false) => {
    const { openTabs } = get();
    const exists = openTabs.find((t) => t.path === path);
    if (!exists) {
      set({ openTabs: [...openTabs, { path, content, loading, error: null }] });
    }
    set({ activeTabPath: path });
  },

  closeTab: (path) => {
    const { openTabs, activeTabPath } = get();
    const filtered = openTabs.filter((t) => t.path !== path);
    let nextActive = activeTabPath;
    if (activeTabPath === path) {
      const idx = openTabs.findIndex((t) => t.path === path);
      nextActive = filtered[Math.max(0, idx - 1)]?.path ?? null;
    }
    set({ openTabs: filtered, activeTabPath: nextActive });
  },

  updateTabContent: (path, content) => {
    set((state) => ({
      openTabs: state.openTabs.map((t) =>
        t.path === path ? { ...t, content, loading: false, error: null } : t
      ),
    }));
  },

  setTabLoading: (path, loading) => {
    set((state) => ({
      openTabs: state.openTabs.map((t) =>
        t.path === path ? { ...t, loading } : t
      ),
    }));
  },

  setTabError: (path, error) => {
    set((state) => ({
      openTabs: state.openTabs.map((t) =>
        t.path === path ? { ...t, error, loading: false } : t
      ),
    }));
  },

  setActiveTab: (path) => set({ activeTabPath: path }),

  // ─── Chat ─────────────────────────────────────────────────
  chatHistory: [],    // [{ id, role: 'user'|'assistant', content, steps, timestamp }]
  sseProgress: [],    // current streaming steps [{ type, message }]
  isAIRunning: false,
  aiAbortController: null,

  addUserMessage: (content) => {
    const msg = {
      id: Date.now(),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };
    set((state) => ({ chatHistory: [...state.chatHistory, msg] }));
  },

  startAIResponse: (abortController) => {
    set({ isAIRunning: true, sseProgress: [], aiAbortController: abortController });
  },

  addSSEStep: (step) => {
    set((state) => ({ sseProgress: [...state.sseProgress, step] }));
  },

  finishAIResponse: (result) => {
    const { sseProgress } = get();
    const msg = {
      id: Date.now(),
      role: 'assistant',
      content: result,
      steps: sseProgress,
      timestamp: new Date().toISOString(),
    };
    set((state) => ({
      chatHistory: [...state.chatHistory, msg],
      sseProgress: [],
      isAIRunning: false,
      aiAbortController: null,
    }));
  },

  cancelAI: () => {
    const { aiAbortController } = get();
    aiAbortController?.abort();
    set({ isAIRunning: false, sseProgress: [], aiAbortController: null });
  },

  // ─── Preview ──────────────────────────────────────────────
  previewKey: 0,
  refreshPreview: () => set((state) => ({ previewKey: state.previewKey + 1 })),

  // ─── Terminal ─────────────────────────────────────────────
  terminalConnected: false,
  setTerminalConnected: (connected) => set({ terminalConnected: connected }),

  // ─── Toasts ───────────────────────────────────────────────
  toasts: [],
  addToast: (message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    set((state) => ({ toasts: [...state.toasts, { id, message, type, duration }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, duration);
  },
  removeToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },

  // ─── UI ───────────────────────────────────────────────────
  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
}));

export default useAppStore;
