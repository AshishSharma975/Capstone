/**
 * AppLayout.jsx — Root workspace layout shell
 * Renders: Sidebar + 3-column resizable panels + status bar
 */
import StatusBar from '../StatusBar/StatusBar';
import ToastContainer from '../UI/Toast';

export default function AppLayout({ sidebar, centerTop, centerBottom, rightTop, rightBottom }) {
  return (
    <div
      className="flex flex-col"
      style={{ height: '100vh', width: '100vw', overflow: 'hidden', background: 'var(--bg-base)' }}
    >
      {/* Main workspace (fills all available space above status bar) */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar */}
        <div
          style={{
            width: '240px',
            minWidth: '160px',
            flexShrink: 0,
            borderRight: '1px solid var(--border)',
            overflow: 'hidden',
          }}
        >
          {sidebar}
        </div>

        {/* Center panel — resizable vertical split */}
        <div
          className="flex flex-col flex-1 overflow-hidden"
          style={{ borderRight: '1px solid var(--border)', minWidth: 0 }}
        >
          {/* Chat — top ~40% */}
          <div
            style={{ height: '42%', minHeight: '120px', overflow: 'hidden', borderBottom: '1px solid var(--border)' }}
          >
            {centerTop}
          </div>

          {/* Resize handle — vertical */}
          <div
            className="resize-handle resize-handle-v"
            style={{ height: '4px', width: '100%', background: 'var(--border)', flexShrink: 0, cursor: 'row-resize' }}
          />

          {/* Editor — bottom ~60% */}
          <div style={{ flex: 1, overflow: 'hidden' }}>
            {centerBottom}
          </div>
        </div>

        {/* Right panel — preview + terminal, vertical split */}
        <div
          className="flex flex-col overflow-hidden"
          style={{ width: '400px', minWidth: '280px', flexShrink: 0 }}
        >
          {/* Preview — top ~55% */}
          <div style={{ height: '55%', minHeight: '120px', overflow: 'hidden', borderBottom: '1px solid var(--border)' }}>
            {rightTop}
          </div>

          {/* Resize handle */}
          <div
            className="resize-handle resize-handle-v"
            style={{ height: '4px', width: '100%', background: 'var(--border)', flexShrink: 0, cursor: 'row-resize' }}
          />

          {/* Terminal — bottom ~45% */}
          <div style={{ flex: 1, overflow: 'hidden' }}>
            {rightBottom}
          </div>
        </div>
      </div>

      {/* Status bar */}
      <StatusBar />

      {/* Global toast notifications */}
      <ToastContainer />
    </div>
  );
}
