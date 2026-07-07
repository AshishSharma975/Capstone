import express from "express"
import morgan from "morgan"
import axios from "axios"
import { createPod } from "./kubernetes/pod.js";
import { createService } from "./kubernetes/service.js";
import { cleanupOldSandboxes } from "./kubernetes/cleanup.js";
import {v7 as uuid} from "uuid"
import { createSandboxKey } from "./config/redis.js";


const app = express();

app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }))

app.get("/api/sandbox/health", (req, res) => {
    res.status(200).json({
        message: "OK",
        status: 200,
        timestamp: new Date().toISOString()
    });
}); 

app.post("/api/sandbox/start", async (req, res) => {
    try {
        const sandboxId = uuid();
        await cleanupOldSandboxes(0).catch(err => console.error("Cleanup failed:", err));

        await Promise.all([
            createPod(sandboxId),
            createService(sandboxId),
            createSandboxKey(sandboxId)
        ]);

        console.log("sandbox environment is created successfully");

        return res.status(201).json({
            message: "sandbox environment is created successfully",
            sandboxId,
            previewUrl: `http://${sandboxId}.preview.localhost`
        });

    } catch (error) {
        console.error("FULL ERROR =>", error);

        let errorMessage = error.message;
        if (errorMessage && (errorMessage.includes('actively refused') || errorMessage.includes('ECONNREFUSED') || errorMessage.includes('connectex'))) {
            errorMessage = "Kubernetes cluster is not running. Please start Docker Desktop before starting the sandbox.";
        }

        return res.status(500).json({
            message: errorMessage
        });
    }
});

// ── Agent proxy routes ────────────────────────────────────────────────────────
// These routes forward requests to the correct sandbox pod using x-sandbox-id.
// This avoids CORS issues when the frontend calls agent APIs.

async function proxyToAgent(req, res, path) {
    const sandboxId = req.headers['x-sandbox-id'];
    if (!sandboxId) return res.status(400).json({ message: 'Missing x-sandbox-id header' });

    const agentUrl = `http://127.0.0.1${path}`;
    const agentHost = `${sandboxId}.agent.localhost`;

    try {
        const axiosConfig = {
            headers: { Host: agentHost },
            params: req.query,
        };

        let response;
        if (req.method === 'GET') {
            response = await axios.get(agentUrl, axiosConfig);
        } else if (req.method === 'PATCH') {
            response = await axios.patch(agentUrl, req.body, { ...axiosConfig, timeout: 300000 });
        } else if (req.method === 'POST') {
            response = await axios.post(agentUrl, req.body, axiosConfig);
        }

        return res.status(response.status).json(response.data);
    } catch (error) {
        console.error(`Agent proxy error for ${path}:`, error.message);
        return res.status(error.response?.status || 502).json({
            message: error.response?.data?.message || error.message
        });
    }
}

app.get('/api/agent/list-files', (req, res) => proxyToAgent(req, res, '/list-files'));
app.get('/api/agent/read-files', (req, res) => proxyToAgent(req, res, '/read-files'));
app.patch('/api/agent/update-files', (req, res) => proxyToAgent(req, res, '/update-files'));
app.post('/api/agent/create-files', (req, res) => proxyToAgent(req, res, '/create-files'));


export default app;

