/**
 * fileUtils.js — Helpers for file extensions, icons, and language detection
 */

/** Map file extension → Prism/highlight language identifier */
export const EXTENSION_TO_LANGUAGE = {
  js: 'javascript',
  jsx: 'jsx',
  ts: 'typescript',
  tsx: 'tsx',
  html: 'html',
  css: 'css',
  scss: 'scss',
  json: 'json',
  md: 'markdown',
  py: 'python',
  sh: 'bash',
  bash: 'bash',
  yml: 'yaml',
  yaml: 'yaml',
  toml: 'toml',
  env: 'bash',
  gitignore: 'bash',
  dockerignore: 'bash',
  dockerfile: 'docker',
  txt: 'plaintext',
  xml: 'xml',
  svg: 'xml',
  rs: 'rust',
  go: 'go',
  rb: 'ruby',
  php: 'php',
  java: 'java',
  c: 'c',
  cpp: 'cpp',
  cs: 'csharp',
};

/** Map file extension → colour (matching VS Code file icon theme) */
export const EXTENSION_TO_COLOR = {
  js: '#f0db4f',
  jsx: '#61dafb',
  ts: '#3178c6',
  tsx: '#61dafb',
  html: '#e44d26',
  css: '#264de4',
  scss: '#cc6699',
  json: '#cbcb41',
  md: '#519aba',
  py: '#3572a5',
  sh: '#89e051',
  bash: '#89e051',
  yml: '#cc3e44',
  yaml: '#cc3e44',
  dockerfile: '#0db7ed',
  rs: '#dea584',
  go: '#00acd7',
  rb: '#cc342d',
  env: '#ecd53f',
  svg: '#ffb13b',
};

/**
 * Get the file extension from a file path.
 * @param {string} filePath
 * @returns {string}
 */
export function getExtension(filePath) {
  const parts = filePath.split('.');
  if (parts.length < 2) return '';
  const ext = parts[parts.length - 1].toLowerCase();
  // Handle dotfiles like .gitignore
  if (parts[0] === '' && parts.length === 2) return parts[1].toLowerCase();
  return ext;
}

/**
 * Get the language identifier for syntax highlighting.
 * @param {string} filePath
 * @returns {string}
 */
export function getLanguage(filePath) {
  const ext = getExtension(filePath);
  return EXTENSION_TO_LANGUAGE[ext] || 'plaintext';
}

/**
 * Get colour for file icon.
 * @param {string} filePath
 * @returns {string}
 */
export function getFileColor(filePath) {
  const ext = getExtension(filePath);
  return EXTENSION_TO_COLOR[ext] || '#8b8fa8';
}

/**
 * Get just the filename from a full path.
 * @param {string} filePath
 * @returns {string}
 */
export function getFileName(filePath) {
  return filePath.split('/').pop();
}

/**
 * Build a nested tree structure from a flat file list.
 * @param {string[]} files
 * @returns {object}
 */
export function buildFileTree(files) {
  const root = {};

  files.forEach((filePath) => {
    const parts = filePath.split('/');
    let node = root;

    parts.forEach((part, i) => {
      if (!node[part]) {
        node[part] = i === parts.length - 1
          ? { __file: true, __path: filePath }
          : {};
      }
      if (!node[part].__file) {
        node = node[part];
      }
    });
  });

  return root;
}
