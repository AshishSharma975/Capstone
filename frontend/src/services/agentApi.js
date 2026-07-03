/**
 * agentApi.js — File operations via sandbox agent
 * All requests go through /api/agent proxy to avoid CORS issues.
 * The backend uses the sandboxId to set the correct Host header.
 */
import axios from 'axios';

/**
 * List all files in the sandbox.
 * @param {string} sandboxId
 * @returns {Promise<string[]>} flat list of file paths
 */
export async function listFiles(sandboxId) {
  const response = await axios.get('/api/agent/list-files', {
    headers: { 'x-sandbox-id': sandboxId },
  });
  return response.data.files;
}

/**
 * Read a single file's content from the sandbox.
 * @param {string} sandboxId
 * @param {string} filePath
 * @returns {Promise<string>} file content
 */
export async function readFile(sandboxId, filePath) {
  const response = await axios.get('/api/agent/read-files', {
    headers: { 'x-sandbox-id': sandboxId },
    params: { files: filePath },
  });
  const data = response.data;
  // files is an array of objects: [{"/path/to/file": "content"}, ...]
  if (Array.isArray(data.files) && data.files.length > 0) {
    // Some endpoints return {"/src/App.jsx": "content"}
    const firstFileObj = data.files[0];
    if (typeof firstFileObj === 'object') {
      const values = Object.values(firstFileObj);
      if (values.length > 0) {
        return values[0] ?? '';
      }
    }
  }
  if (data.content) return data.content;
  return JSON.stringify(data, null, 2);
}

/**
 * Update one or more files in the sandbox.
 * @param {string} sandboxId
 * @param {Array<{ file: string, content: string }>} updates
 * @returns {Promise<void>}
 */
export async function updateFiles(sandboxId, updates) {
  await axios.patch('/api/agent/update-files', { updates }, {
    headers: { 'x-sandbox-id': sandboxId },
  });
}
