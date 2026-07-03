/**
 * sandboxApi.js — Sandbox lifecycle API
 */
import axios from 'axios';

const BASE_URL = '';

/**
 * Start a new sandbox environment.
 * @returns {Promise<{ sandboxId: string, previewUrl: string, message: string }>}
 */
export async function startSandbox() {
  const response = await axios.post(`${BASE_URL}/api/sandbox/start`);
  return response.data;
}
