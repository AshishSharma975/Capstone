import http from "http";
import app from "./src/app.js";

const PORT = process.env.PORT || 3001;

const server = http.createServer(app);

// WebSocket upgrade support
server.on("upgrade", (req, socket, head) => {
  const host = req.headers.host;
  const sandboxId = host.split(".")[0];
  const subdomain = host.split(".")[1];
  
  if (subdomain === "agent") {
    app.agentUpgrade(req, socket, head, sandboxId);
  } else if (subdomain === "preview") {
    app.previewUpgrade(req, socket, head, sandboxId);
  } else {
    socket.destroy();
  }
});

server.listen(PORT, () => {
  console.log(`Router is running on the port ${PORT}`);
});