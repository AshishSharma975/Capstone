/**
 * StatusBar.jsx — Bottom VS Code-style status bar
 */
import { GitBranch, Wifi, WifiOff, Circle, Zap } from 'lucide-react';
import useAppStore from '../../store/useAppStore';

export default function StatusBar() {
  const { sandboxId, terminalConnected, isAIRunning, activeTabPath } = useAppStore();

  return (
    <div
      className="h-7 flex items-center justify-between px-3 shrink-0 select-none"
      style={{
        background: 'var(--bg-base)',
        borderTop: '1px solid var(--border)',
        fontSize: '11px',
        color: 'var(--text-muted)',
      }}
    >
      {/* Left section */}
      <div className="flex items-center gap-4">
        {/* Sandbox ID */}
        <div className="flex items-center gap-1.5">
          <div
            className="w-2 h-2 rounded-full"
            style={{ background: sandboxId ? 'var(--success)' : 'var(--text-muted)' }}
          />
          <span style={{ color: 'var(--text-secondary)' }}>
            {sandboxId ? `Sandbox: ${sandboxId.slice(0, 8)}…` : 'No sandbox'}
          </span>
        </div>

        {/* Git branch indicator */}
        <div className="flex items-center gap-1">
          <GitBranch size={11} />
          <span>main</span>
        </div>
      </div>

      {/* Center — active file breadcrumb */}
      {activeTabPath && (
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
          {activeTabPath.split('/').map((part, i, arr) => (
            <span key={i} className="flex items-center gap-1">
              <span className={i === arr.length - 1 ? 'text-[var(--text-primary)]' : ''}>
                {part}
              </span>
              {i < arr.length - 1 && <span className="opacity-40">/</span>}
            </span>
          ))}
        </div>
      )}

      {/* Right section */}
      <div className="flex items-center gap-4">
        {/* AI status */}
        {isAIRunning && (
          <div className="flex items-center gap-1.5 text-[var(--accent)]">
            <Zap size={11} className="animate-pulse" />
            <span>AI running</span>
          </div>
        )}

        {/* Terminal connection */}
        <div className="flex items-center gap-1">
          {terminalConnected ? (
            <>
              <Wifi size={11} className="text-green-400" />
              <span className="text-green-400">Terminal</span>
            </>
          ) : (
            <>
              <WifiOff size={11} />
              <span>Terminal off</span>
            </>
          )}
        </div>

        {/* Language indicator */}
        {activeTabPath && (
          <span style={{ color: 'var(--text-secondary)' }}>
            {activeTabPath.split('.').pop()?.toUpperCase() || 'TEXT'}
          </span>
        )}

        {/* Line endings */}
        <span>UTF-8</span>
      </div>
    </div>
  );
}
