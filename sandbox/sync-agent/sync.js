import "dotenv/config";
import chokidar from 'chokidar';
import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

const WORKSPACE_DIR = process.env.WORKSPACE_DIR || '/workspace';
const API_URL = process.env.SYNC_SERVER_URL || 'http://host.docker.internal:5000';
const PROJECT_ID = process.env.PROJECT_ID;

if (!PROJECT_ID) {
    console.error("PROJECT_ID is not set. Sync agent will not run.");
    process.exit(1);
}

console.log(`Starting Sync Agent for Project ${PROJECT_ID} in ${WORKSPACE_DIR}`);

// 1. Initial Download
async function downloadExistingFiles() {
    try {
        console.log(`Downloading files for project ${PROJECT_ID}...`);
        const response = await axios.get(`${API_URL}/api/sandbox/sync/download/${PROJECT_ID}`);
        const files = response.data.files || [];

        for (const file of files) {
            const fullPath = path.join(WORKSPACE_DIR, file.filePath);
            const dir = path.dirname(fullPath);
            await fs.mkdir(dir, { recursive: true });
            await fs.writeFile(fullPath, file.content, 'utf8');
            console.log(`Restored: ${file.filePath}`);
        }
        console.log("Download complete. Starting watcher...");
    } catch (error) {
        console.error("Failed to download initial files:", error.message);
    }
}

// 2. Start Watcher
async function startWatching() {
    const watcher = chokidar.watch(WORKSPACE_DIR, {
        ignored: [/(^|[\/\\])\../, /node_modules/], // ignore dotfiles and node_modules
        persistent: true,
        ignoreInitial: true
    });

    const syncFile = async (filePath, isDeleted = false) => {
        try {
            // Get relative path from workspace
            const relativePath = path.relative(WORKSPACE_DIR, filePath).replace(/\\/g, '/');
            
            let content = '';
            if (!isDeleted) {
                content = await fs.readFile(filePath, 'utf8');
            }

            await axios.post(`${API_URL}/api/sandbox/sync/upload`, {
                projectId: PROJECT_ID,
                filePath: relativePath,
                content,
                isDeleted
            });
            console.log(`Synced: ${relativePath} (deleted: ${isDeleted})`);
        } catch (error) {
            console.error(`Failed to sync ${filePath}:`, error.message);
        }
    };

    watcher
        .on('add', p => syncFile(p))
        .on('change', p => syncFile(p))
        .on('unlink', p => syncFile(p, true));
}

// Main execution
(async () => {
    // Ensure workspace exists
    await fs.mkdir(WORKSPACE_DIR, { recursive: true });
    
    // Download old files first
    await downloadExistingFiles();
    
    // Then watch for new changes
    await startWatching();
})();