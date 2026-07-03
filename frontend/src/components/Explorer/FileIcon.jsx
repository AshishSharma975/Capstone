/**
 * FileIcon.jsx — Coloured file/folder icon by extension
 */
import { File, Folder, FolderOpen } from 'lucide-react';
import { getFileColor, getExtension } from '../../utils/fileUtils';

// Emoji / letter icons for special extensions
const SPECIAL_ICONS = {
  jsx: '⚛',
  tsx: '⚛',
  js: 'JS',
  ts: 'TS',
  html: 'HT',
  css: 'CS',
  json: '{}',
  md: '📝',
  env: '🔑',
  dockerfile: '🐳',
  yml: '⚙',
  yaml: '⚙',
  sh: '$_',
  bash: '$_',
  py: '🐍',
  rs: '🦀',
  go: '🔵',
};

export function FileIcon({ filePath, size = 14 }) {
  const ext = getExtension(filePath);
  const color = getFileColor(filePath);
  const special = SPECIAL_ICONS[ext];

  if (special) {
    return (
      <span
        style={{ color, fontSize: ext.length > 1 ? '8px' : '11px', fontWeight: 700, fontFamily: 'var(--font-mono)', lineHeight: 1, minWidth: size }}
        className="flex items-center justify-center"
      >
        {special}
      </span>
    );
  }

  return <File size={size} style={{ color, flexShrink: 0 }} />;
}

export function FolderIcon({ isOpen, size = 14 }) {
  return isOpen
    ? <FolderOpen size={size} style={{ color: '#e8b84b', flexShrink: 0 }} />
    : <Folder size={size} style={{ color: '#e8b84b', flexShrink: 0 }} />;
}
