import { PanelLeft, Home } from 'lucide-react';
import FileExplorer from '../Explorer/FileExplorer';
import useAppStore from '../../store/useAppStore';

export default function Sidebar() {
  const sidebarCollapsed = useAppStore(state => state.sidebarCollapsed);
  const toggleSidebar = useAppStore(state => state.toggleSidebar);
  const setSandbox = useAppStore(state => state.setSandbox);

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

      {/* Sidebar bottom bar */}
      {!sidebarCollapsed && (
        <div
          className="flex items-center gap-2 p-2 shrink-0"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <button
            onClick={() => {
              if (window.confirm("Return to projects page?")) {
                setSandbox(null, null);
              }
            }}
            title="Projects Page"
            className="flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium w-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-all"
            style={{ border: '1px solid var(--border)', cursor: 'pointer', background: 'none' }}
          >
            <Home size={12} />
            Go to Projects
          </button>
        </div>
      )}
    </div>
  );
}
