/**
 * sandboxApi.js — Sandbox lifecycle API
 */
import axios from 'axios';

// Pre-configured axios instance — withCredentials ensures auth cookies
// are automatically included in every request to the backend.
const api = axios.create({
  withCredentials: true,
});

/**
 * Start a new sandbox environment.
 * @returns {Promise<{ sandboxId: string, previewUrl: string, message: string }>}
 */
export async function startSandbox(projectId = null) {
  const response = await api.post('/api/sandbox/start', { projectId });
  return response.data;
}

/**
 * Get user's projects.
 */
export async function getProjects() {
  const response = await api.get('/api/sandbox/projects');
  return response.data.projects || [];
}

