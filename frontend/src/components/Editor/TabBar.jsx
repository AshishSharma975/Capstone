/**
 * TabBar.jsx — Multi-tab file editor tab bar
 */
import { X } from 'lucide-react';
import { FileIcon } from '../Explorer/FileIcon';
import { getFileName } from '../../utils/fileUtils';
import useAppStore from '../../store/useAppStore';

export default function TabBar() {
  const openTabs = useAppStore(state => state.openTabs);
  const activeTabPath = useAppStore(state => state.activeTabPath);
  const setActiveTab = useAppStore(state => state.setActiveTab);
  const closeTab = useAppStore(state => state.closeTab);

  if (openTabs.length === 0) return null;

  return (
    <div
      className="flex items-end overflow-x-auto shrink-0"
      style={{
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border)',
        height: '36px',
      }}
    >
      {openTabs.map((tab) => {
        const isActive = tab.path === activeTabPath;
        return (
          <div
            key={tab.path}
            className="flex items-center gap-1.5 px-3 h-full shrink-0 group cursor-pointer border-r select-none"
            style={{
              borderRightColor: 'var(--border)',
              background: isActive ? 'var(--bg-base)' : 'transparent',
              borderTop: isActive ? '1px solid var(--accent)' : '1px solid transparent',
              color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
              maxWidth: '180px',
              fontSize: '13px',
              transition: 'color 0.1s',
            }}
            onClick={() => setActiveTab(tab.path)}
            title={tab.path}
          >
            <FileIcon filePath={tab.path} size={12} />
            <span className="truncate">{getFileName(tab.path)}</span>
            {tab.loading && (
              <span
                className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] ml-1 animate-pulse"
                style={{ flexShrink: 0 }}
              />
            )}
            {/* Close button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                closeTab(tab.path);
              }}
              className="ml-1 p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-[var(--bg-elevated)] transition-opacity"
              style={{ flexShrink: 0 }}
              title="Close tab"
            >
              <X size={11} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
