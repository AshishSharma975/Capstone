/**
 * EditorPanel.jsx — Code editor panel with tabs and file content
 */
import { Code2 } from 'lucide-react';
import TabBar from './TabBar';
import CodeViewer from './CodeViewer';
import { EditorSkeleton } from '../UI/Skeleton';
import EmptyState from '../UI/EmptyState';
import useAppStore from '../../store/useAppStore';

export default function EditorPanel() {
  const { openTabs, activeTabPath } = useAppStore();

  const activeTab = openTabs.find((t) => t.path === activeTabPath);

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--bg-base)' }}>
      {/* Tab bar */}
      <TabBar />

      {/* Editor content area */}
      <div className="flex-1 overflow-hidden">
        {!activeTab ? (
          <EmptyState
            icon={Code2}
            title="No file open"
            description="Click a file in the explorer to open it here"
          />
        ) : activeTab.loading ? (
          <EditorSkeleton />
        ) : activeTab.error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-8">
              <p className="text-red-400 text-sm font-medium mb-2">Failed to load file</p>
              <p className="text-[var(--text-muted)] text-xs">{activeTab.error}</p>
            </div>
          </div>
        ) : (
          <CodeViewer content={activeTab.content} filePath={activeTab.path} />
        )}
      </div>
    </div>
  );
}
