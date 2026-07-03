/**
 * agentApi.js — File operations via sandbox agent
 * All requests go to http://{sandboxId}.agent.localhost
 */
import axios from 'axios';

/**
 * Build the base URL for a given sandbox agent.
 * @param {string} sandboxId
 * @returns {string}
 */
function agentBase(sandboxId) {
  return `http://${sandboxId}.agent.localhost`;
}

/**
 * List all files in the sandbox.
 * @param {string} sandboxId
 * @returns {Promise<string[]>} flat list of file paths
 */
export async function listFiles(sandboxId) {
  const response = await axios.get(`${agentBase(sandboxId)}/list-files`);
  return response.data.files;
}

/**
 * Read a single file's content from the sandbox.
 * @param {string} sandboxId
 * @param {string} filePath
 * @returns {Promise<string>} file content
 */
export async function readFile(sandboxId, filePath) {
  const response = await axios.get(`${agentBase(sandboxId)}/read-files`, {
    params: { files: filePath },
  });
  // Response may be { content: "..." } or { files: { "path": "content" } }
  const data = response.data;
  if (typeof data === 'string') return data;
  if (data.content) return data.content;
  if (data.files) {
    const values = Object.values(data.files);
    return values[0] ?? '';
  }
  return JSON.stringify(data, null, 2);
}

/**
 * Update one or more files in the sandbox.
 * @param {string} sandboxId
 * @param {Array<{ file: string, content: string }>} updates
 * @returns {Promise<void>}
 */
export async function updateFiles(sandboxId, updates) {
  await axios.patch(`${agentBase(sandboxId)}/update-files`, { updates });
}
