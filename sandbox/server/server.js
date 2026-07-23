import "dotenv/config.js";
import http from "http";
import httpProxy from "http-proxy";
import app from "./src/app.js";
import connectDB from "./src/config/db.js";
connectDB();

const PORT = 5000;
const server = http.createServer(app);

const wsProxy = httpProxy.createProxyServer({ ws: true });

wsProxy.on('error', (err, req, socket) => {
  console.error("Agent WS Proxy Error:", err.message);
  console.error(err.stack);
  if (socket) socket.end('HTTP/1.1 502 Bad Gateway\r\n\r\n');
});

wsProxy.on('proxyReqWs', (proxyReq, req, socket, options, head) => {
  if (req.agentHost) {
    proxyReq.setHeader('host', req.agentHost);
  }
});

server.on('upgrade', (req, socket, head) => {
  if (req.url.startsWith('/api/agent-ws/')) {
    // URL looks like: /api/agent-ws/socket.io/?sandboxId=...&EIO=4&transport=websocket
    const url = new URL(req.url, `http://${req.headers.host}`);
    const sandboxId = url.searchParams.get('sandboxId');

    if (!sandboxId) {
      console.error("Missing sandboxId in WS upgrade");
      return socket.destroy();
    }

    const agentHost = `${sandboxId}.agent.localhost`;
    const targetUrl = `http://127.0.0.1`;
    
    req.agentHost = agentHost; // attach for proxyReqWs to use

    // Rewrite URL to remove /api/agent-ws
    req.url = req.url.replace('/api/agent-ws', '');

    socket.on('error', (err) => {
      console.error("Client socket error:", err.message);
    });

    wsProxy.ws(req, socket, head, {
      target: targetUrl,
      changeOrigin: true
    });
  } else {
    socket.destroy();
  }
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
// trigger restart
