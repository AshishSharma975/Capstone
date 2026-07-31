import express from "express"
import morgan from "morgan"
import cors from "cors"
import axios from "axios"
import cookieParser from "cookie-parser";
import sandboxRouter from './routes/sandbox.routes.js'
const app = express();

// CORS — allow all localhost origins with credentials (cookies)
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests from any localhost port (frontend, tools, etc.)
        if (!origin || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,            // <-- allows cookies to be sent
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-sandbox-id'],
}));

app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())


app.get("/api/sandbox/health", (req, res) => {
    res.status(200).json({
        message: "OK",
        status: 200,
        timestamp: new Date().toISOString()
    });
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

app.use('/api/sandbox',sandboxRouter)
export default app;

