import express from "express";
import morgan from "morgan";
import cors from "cors";
import { createProxyMiddleware } from "http-proxy-middleware";
import { refreshTTL } from "./config/redis.js";

const app = express();


app.use(morgan("combined"));
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);


app.get("/api/status/healthz", (req, res) => {
  res.status(200).json({ status: "healthy" });
});

app.get("/api/status/readyz", (req, res) => {
  res.status(200).json({ status: "ready" });
});


const proxies = {}
const agentProxies = {}

function getProxy(sandboxId){
    if(!proxies[sandboxId]){
        proxies[sandboxId] = createProxyMiddleware({
            target: `http://sandbox-service-${sandboxId}`,
            changeOrigin: true,
        });
    }
    return proxies[sandboxId];
}

function getAgentProxy(sandboxId){
    if(!agentProxies[sandboxId]){
        agentProxies[sandboxId] = createProxyMiddleware({
            target: `http://sandbox-service-${sandboxId}:8080`,
            changeOrigin: true,
        });
    }
    return agentProxies[sandboxId];
}

app.use(async (req, res, next) => {
  const host = req.headers.host;
  const xSandboxId = req.headers['x-sandbox-id'];
  
  let sandboxId;
  let type;

  if (xSandboxId) {
    sandboxId = xSandboxId;
    if (req.url.startsWith('/api/agent')) {
      type = 'agent';
      req.url = req.url.replace('/api/agent', '');
    } else {
      type = 'preview';
    }
  } else {
    sandboxId = host.split(".")[0];
    type = host.split(".")[1];
  }

  try {
    await refreshTTL(sandboxId);
  } catch (error) {
    console.error("Failed to refresh TTL:", error);
  }

  console.log("ROUTER MIDDLEWARE HIT:", { host, xSandboxId, url: req.url, sandboxId, type });

  if (type === "agent") {
    return getAgentProxy(sandboxId)(req, res, next);
  } else if (type === "preview") {
    return getProxy(sandboxId)(req, res, next);
  }
  
  return res.status(404).json({
    message: "Invalid host name or sandbox id",
    status: 404
  });
});

import httpProxy from "http-proxy";
const agentWsProxy = httpProxy.createProxyServer({ ws: true, changeOrigin: true });
const previewWsProxy = httpProxy.createProxyServer({ ws: true, changeOrigin: false });

agentWsProxy.on('error', (err, req, socket) => {
  console.error("agentWsProxy ERROR:", err);
  if (socket) socket.end('HTTP/1.1 502 Bad Gateway\r\n\r\n');
});

previewWsProxy.on('error', (err, req, socket) => {
  console.error("previewWsProxy ERROR:", err);
  if (socket) socket.end('HTTP/1.1 502 Bad Gateway\r\n\r\n');
});

// WebSocket upgrade handlers (called from server.js)
app.agentUpgrade = (req, socket, head, sandboxId) => {
  agentWsProxy.ws(req, socket, head, {
    target: `http://sandbox-service-${sandboxId}:8080`
  });
};

app.previewUpgrade = (req, socket, head, sandboxId) => {
  previewWsProxy.ws(req, socket, head, {
    target: `http://sandbox-service-${sandboxId}:80`
  });
};

export default app;