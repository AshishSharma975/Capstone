/**
 * FileExplorer.jsx — Left panel file explorer
 */
import { useEffect } from 'react';
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
  const [loading, setLoading] = [false, () => {}]; // managed via try/catch in hook

  // Load files when sandbox is ready
  useEffect(() => {
    if (sandboxId) {
      loadFiles();
    }
  }, [sandboxId, loadFiles]);

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
          onClick={loadFiles}
          title="Refresh files"
          className="p-1 rounded hover:bg-[var(--bg-elevated)] transition-colors"
          style={{ color: 'var(--text-muted)' }}
        >
          <RefreshCw size={13} />
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
        ) : files.length === 0 ? (
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
