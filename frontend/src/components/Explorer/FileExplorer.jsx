/**
 * FileExplorer.jsx — Left panel file explorer
 */
import { useEffect, useState } from 'react';
import { RefreshCw, FolderOpen } from 'lucide-react';
import FileTree from './FileTree';
import { FileSkeleton } from '../UI/Skeleton';
import EmptyState from '../UI/EmptyState';
import useAppStore from '../../store/useAppStore';
import { useFileExplorer } from '../../hooks/useFileExplorer';
import { buildFileTree } from '../../utils/fileUtils';

export default function FileExplorer() {
  const files = useAppStore(state => state.files);
  const sandboxId = useAppStore(state => state.sandboxId);
  const { loadFiles, openFile } = useFileExplorer();
  const [isLoading, setIsLoading] = useState(false);

  // Wrapped loadFiles with local loading state
  const handleRefresh = async () => {
    setIsLoading(true);
    await loadFiles();
    setIsLoading(false);
  };


  // Load files when sandbox is ready
  useEffect(() => {
    if (sandboxId) {
      handleRefresh();
    }
  }, [sandboxId]); // eslint-disable-line react-hooks/exhaustive-deps


  const fileTree = buildFileTree(files);
  const treeEntries = Object.entries(fileTree);

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--bg-surface)' }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2 shrink-0"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <span
          style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase' }}
        >
          Explorer
        </span>
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          title="Refresh files"
          className="p-1 rounded hover:bg-[var(--bg-elevated)] transition-colors"
          style={{ color: 'var(--text-muted)' }}
        >
          <RefreshCw size={13} style={{ animation: isLoading ? 'spin 1s linear infinite' : 'none' }} />
        </button>
      </div>

      {/* File tree */}
      <div className="flex-1 scrollable py-1">
        {!sandboxId ? (
          <EmptyState
            icon={FolderOpen}
            title="No sandbox"
            description="Start a sandbox to browse files"
          />
        ) : isLoading || files.length === 0 ? (
          <FileSkeleton />
        ) : (
          treeEntries
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([name, node]) => (
              <FileTree
                key={name}
                name={name}
                node={node}
                depth={0}
                onFileClick={openFile}
              />
            ))
        )}
      </div>
    </div>
  );
}
