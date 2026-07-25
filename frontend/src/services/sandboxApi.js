/**
 * sandboxApi.js — Sandbox lifecycle API
 */
import axios from 'axios';

const BASE_URL = '';

/**
 * Start a new sandbox environment.
 * @returns {Promise<{ sandboxId: string, previewUrl: string, message: string }>}
 */
export async function startSandbox(projectId = null) {
  const response = await axios.post(`${BASE_URL}/api/sandbox/start`, { projectId });
  return response.data;
}

/**
 * Get user's projects.
 */
export async function getProjects() {
  const response = await axios.get(`${BASE_URL}/api/sandbox/projects`);
  return response.data.projects || [];
}
