import http from "http";
import app from "./src/app.js";

const PORT = process.env.PORT || 3001;

const server = http.createServer(app);

// WebSocket upgrade support
server.on("upgrade", (req, socket, head) => {
  const host = req.headers.host;
  console.log("UPGRADE EVENT RECEIVED FOR HOST:", host, "URL:", req.url);
  const sandboxId = host.split(".")[0];
  const subdomain = host.split(".")[1];
  
  if (subdomain === "agent") {
    console.log("Routing agent upgrade to", sandboxId);
    app.agentUpgrade(req, socket, head, sandboxId);
  } else if (subdomain === "preview") {
    console.log("Routing preview upgrade to", sandboxId);
    app.previewUpgrade(req, socket, head, sandboxId);
  } else {
    console.log("Destroying socket for unknown upgrade");
    socket.destroy();
  }
});

server.listen(PORT, () => {
  console.log(`Router is running on the port ${PORT}`);
});