/**
 * FileTree.jsx — Recursive file tree node renderer
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { FileIcon, FolderIcon } from './FileIcon';
import { getFileName } from '../../utils/fileUtils';
import useAppStore from '../../store/useAppStore';

/**
 * Renders a single tree node (file or folder).
 * @param {{ name: string, node: object, depth: number, onFileClick: function }} props
 */
export default function FileTree({ name, node, depth = 0, onFileClick }) {
  const [isOpen, setIsOpen] = useState(depth < 1); // auto-open top level
  const { activeTabPath } = useAppStore();

  const isFile = node.__file === true;
  const filePath = node.__path;
  const isActive = activeTabPath === filePath;

  const children = isFile
    ? []
    : Object.entries(node).filter(([k]) => !k.startsWith('__'));

  if (isFile) {
    return (
      <button
        onClick={() => onFileClick(filePath)}
        className="w-full text-left flex items-center gap-1.5 px-2 py-[3px] rounded-sm group transition-colors"
        style={{
          paddingLeft: `${8 + depth * 12}px`,
          background: isActive ? 'var(--accent-subtle)' : 'transparent',
          color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
          fontSize: '13px',
        }}
        onMouseEnter={(e) => {
          if (!isActive) e.currentTarget.style.background = 'var(--bg-elevated)';
        }}
        onMouseLeave={(e) => {
          if (!isActive) e.currentTarget.style.background = 'transparent';
        }}
      >
        <FileIcon filePath={filePath} size={13} />
        <span className="truncate">{getFileName(filePath)}</span>
      </button>
    );
  }

  // Folder node
  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left flex items-center gap-1 px-2 py-[3px] rounded-sm transition-colors"
        style={{
          paddingLeft: `${8 + depth * 12}px`,
          color: 'var(--text-primary)',
          fontSize: '13px',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-elevated)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
      >
        <ChevronRight
          size={12}
          style={{
            transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
            transition: 'transform 0.15s',
            color: 'var(--text-muted)',
            flexShrink: 0,
          }}
        />
        <FolderIcon isOpen={isOpen} size={13} />
        <span className="truncate font-medium">{name}</span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            style={{ overflow: 'hidden' }}
          >
            {children
              .sort(([aName, aNode], [bName, bNode]) => {
                // Folders first, then files, both alphabetical
                const aIsFile = aNode.__file;
                const bIsFile = bNode.__file;
                if (aIsFile !== bIsFile) return aIsFile ? 1 : -1;
                return aName.localeCompare(bName);
              })
              .map(([childName, childNode]) => (
                <FileTree
                  key={childName}
                  name={childName}
                  node={childNode}
                  depth={depth + 1}
                  onFileClick={onFileClick}
                />
              ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
