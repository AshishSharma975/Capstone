/**
 * TerminalPanel.jsx — XTerm.js interactive terminal via Socket.IO
 */
import { useEffect, useRef } from 'react';
import { Terminal, Wifi, WifiOff } from 'lucide-react';
import useAppStore from '../../store/useAppStore';
import { useTerminal } from '../../hooks/useTerminal';

// Import XTerm CSS (required for correct rendering)
import '@xterm/xterm/css/xterm.css';

export default function TerminalPanel() {
  const containerRef = useRef(null);
  const sandboxId = useAppStore(state => state.sandboxId);
  const terminalConnected = useAppStore(state => state.terminalConnected);
  const { initTerminal, cleanup, fitTerminal } = useTerminal(containerRef, sandboxId);

  useEffect(() => {
    // Small delay to ensure the container has dimensions
    const timer = setTimeout(() => {
      initTerminal();
    }, 150);

    return () => {
      clearTimeout(timer);
      cleanup();
    };
    // Only re-init when sandboxId changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sandboxId]);

  // Refit when panel becomes visible/resized
  useEffect(() => {
    const observer = new ResizeObserver(() => fitTerminal());
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [fitTerminal]);

  return (
    <div
      className="flex flex-col h-full"
      style={{ background: 'var(--terminal-bg)' }}
    >
      {/* Toolbar */}
      <div
        className="flex items-center gap-2 px-3 py-2 shrink-0"
        style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)' }}
      >
        <Terminal size={13} style={{ color: terminalConnected ? 'var(--success)' : 'var(--text-muted)' }} />
        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', flex: 1 }}>
          Terminal
        </span>

        {/* Connection badge */}
        <div
          className="flex items-center gap-1.5 px-2 py-0.5 rounded-full"
          style={{
            background: terminalConnected ? 'rgba(34,211,160,0.1)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${terminalConnected ? 'rgba(34,211,160,0.2)' : 'var(--border)'}`,
            fontSize: '10px',
          }}
        >
          {terminalConnected
            ? <><Wifi size={10} className="text-green-400" /><span className="text-green-400">Connected</span></>
            : <><WifiOff size={10} style={{ color: 'var(--text-muted)' }} /><span style={{ color: 'var(--text-muted)' }}>Disconnected</span></>
          }
        </div>
      </div>

      {/* XTerm container */}
      <div
        ref={containerRef}
        className="flex-1"
        style={{
          overflow: 'hidden',
          padding: '8px',
        }}
      />
    </div>
  );
}
