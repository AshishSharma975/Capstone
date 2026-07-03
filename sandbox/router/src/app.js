import express from "express";
import morgan from "morgan";
import cors from "cors";
import { createProxyMiddleware } from "http-proxy-middleware";

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

app.use((req, res, next) => {
  const host = req.headers.host;
  console.log("EXPRESS MIDDLEWARE HIT FOR HOST:", host, "URL:", req.url, "HEADERS:", req.headers.upgrade);
  const sandboxId = host.split(".")[0];
   if(host.split(".")[1]==="agent"){
    return getAgentProxy(sandboxId)(req, res, next);
   }else if (host.split(".")[1]==="preview"){
    return getProxy(sandboxId)(req, res, next);
   }
   return res.status(404).json({
        message: "Invalid host name",
        status:404
   });

});

import httpProxy from "http-proxy";
const wsProxy = httpProxy.createProxyServer({ ws: true, changeOrigin: true });

wsProxy.on('error', (err, req, socket) => {
  socket.end('HTTP/1.1 502 Bad Gateway\r\n\r\n');
});

// WebSocket upgrade handlers (called from server.js)
app.agentUpgrade = (req, socket, head, sandboxId) => {
  wsProxy.ws(req, socket, head, {
    target: `http://sandbox-service-${sandboxId}:8080`
  });
};

app.previewUpgrade = (req, socket, head, sandboxId) => {
  wsProxy.ws(req, socket, head, {
    target: `http://sandbox-service-${sandboxId}:80`
  });
};

export default app;