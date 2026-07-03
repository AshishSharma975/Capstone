/**
 * Sidebar.jsx — Collapsible left sidebar with file explorer
 */
import { PanelLeft } from 'lucide-react';
import FileExplorer from '../Explorer/FileExplorer';
import useAppStore from '../../store/useAppStore';

export default function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useAppStore();

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--bg-surface)' }}>
      {/* Sidebar top bar */}
      <div
        className="flex items-center justify-between px-3 py-2 shrink-0"
        style={{
          borderBottom: '1px solid var(--border)',
          height: '40px',
        }}
      >
        <div className="flex items-center gap-2">
          {/* App logo / name */}
          <div
            className="w-5 h-5 rounded flex items-center justify-center"
            style={{ background: 'var(--accent)', fontSize: '10px', fontWeight: 700, color: '#fff' }}
          >
            DS
          </div>
          {!sidebarCollapsed && (
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
              DevSandbox
            </span>
          )}
        </div>
        <button
          onClick={toggleSidebar}
          title="Toggle sidebar"
          className="p-1 rounded hover:bg-[var(--bg-elevated)] transition-colors"
          style={{ color: 'var(--text-muted)' }}
        >
          <PanelLeft size={14} />
        </button>
      </div>

      {/* File explorer */}
      <div className="flex-1 overflow-hidden">
        <FileExplorer />
      </div>
    </div>
  );
}
