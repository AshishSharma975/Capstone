/**
 * useTerminal.js — XTerm.js + Socket.IO terminal hook
 *
 * Usage:
 *   const { initTerminal, cleanup } = useTerminal(containerRef, sandboxId);
 */
import { useRef, useCallback, useEffect } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import { io } from 'socket.io-client';
import useAppStore from '../store/useAppStore';

export function useTerminal(containerRef, sandboxId) {
  const termRef = useRef(null);
  const fitAddonRef = useRef(null);
  const socketRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const { setTerminalConnected, addToast } = useAppStore.getState();

  const connect = useCallback(() => {
    if (!sandboxId || !containerRef.current) return;

    // Connect via Vite proxy to avoid DNS resolution issues on Windows for *.agent.localhost
    const socket = io('/', {
      path: '/api/agent-ws/socket.io',
      // IMPORTANT: websocket-only — polling creates rapid connect/disconnect loops
      // through nginx because each poll is a new HTTP request that looks like a reconnect
      transports: ['websocket'],
      query: { sandboxId },
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10000,
      timeout: 20000,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setTerminalConnected(true);
      termRef.current?.writeln('\r\n\x1b[32m✓ Connected to terminal\x1b[0m\r\n');
    });

    socket.on('disconnect', () => {
      setTerminalConnected(false);
      termRef.current?.writeln('\r\n\x1b[33m⚠ Terminal disconnected\x1b[0m\r\n');
    });

    socket.on('connect_error', () => {
      setTerminalConnected(false);
    });

    // Receive terminal output from server
    socket.on('terminal-output', (data) => {
      termRef.current?.write(data);
    });
  }, [sandboxId, containerRef, setTerminalConnected]);

  const initTerminal = useCallback(() => {
    if (!containerRef.current || termRef.current) return;

    // Create XTerm instance
    const term = new Terminal({
      theme: {
        background: '#090a0d',
        foreground: '#cdd6f4',
        cursor: '#6366f1',
        cursorAccent: '#090a0d',
        black: '#181825',
        red: '#f38ba8',
        green: '#a6e3a1',
        yellow: '#f9e2af',
        blue: '#89b4fa',
        magenta: '#cba6f7',
        cyan: '#94e2d5',
        white: '#bac2de',
        brightBlack: '#45475a',
        brightRed: '#f38ba8',
        brightGreen: '#a6e3a1',
        brightYellow: '#f9e2af',
        brightBlue: '#89b4fa',
        brightMagenta: '#cba6f7',
        brightCyan: '#94e2d5',
        brightWhite: '#a6adc8',
      },
      fontFamily: "'JetBrains Mono', 'Cascadia Code', Consolas, monospace",
      fontSize: 13,
      lineHeight: 1.5,
      cursorBlink: true,
      cursorStyle: 'block',
      scrollback: 5000,
      allowProposedApi: true,
    });

    const fitAddon = new FitAddon();
    const webLinksAddon = new WebLinksAddon();

    term.loadAddon(fitAddon);
    term.loadAddon(webLinksAddon);
    term.open(containerRef.current);

    fitAddonRef.current = fitAddon;
    termRef.current = term;

    // Small delay to ensure DOM is ready before fitting
    setTimeout(() => {
      try { fitAddon.fit(); } catch { /* ignore */ }
    }, 100);

    // Forward keystrokes to server
    term.onData((data) => {
      socketRef.current?.emit('terminal-input', data);
    });

    // Connect socket
    connect();

    // Resize observer to auto-fit terminal
    const observer = new ResizeObserver(() => {
      try { fitAddon.fit(); } catch { /* ignore */ }
    });
    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [containerRef, connect]);

  const cleanup = useCallback(() => {
    socketRef.current?.disconnect();
    termRef.current?.dispose();
    termRef.current = null;
    fitAddonRef.current = null;
    clearTimeout(reconnectTimerRef.current);
  }, []);

  // Expose fit for external resize events
  const fitTerminal = useCallback(() => {
    try { fitAddonRef.current?.fit(); } catch { /* ignore */ }
  }, []);

  return { initTerminal, cleanup, fitTerminal };
}
