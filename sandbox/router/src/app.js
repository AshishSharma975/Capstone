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
            ws: true,
        });
    }
    return proxies[sandboxId];
}

function getAgentProxy(sandboxId){
    if(!agentProxies[sandboxId]){
        agentProxies[sandboxId] = createProxyMiddleware({
            target: `http://sandbox-service-${sandboxId}:8080`,
            changeOrigin: true,
            ws: true,
        });
    }
    return agentProxies[sandboxId];
}

app.use((req, res, next) => {
  const host = req.headers.host;
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

// WebSocket upgrade handlers (called from server.js)
app.agentUpgrade = (req, socket, head, sandboxId) => {
  const proxy = getAgentProxy(sandboxId);
  if (proxy.upgrade) {
    proxy.upgrade(req, socket, head);
  } else {
    socket.destroy();
  }
};

app.previewUpgrade = (req, socket, head, sandboxId) => {
  const proxy = getProxy(sandboxId);
  if (proxy.upgrade) {
    proxy.upgrade(req, socket, head);
  } else {
    socket.destroy();
  }
};

export default app;