import express from "express";
import morgan from "morgan";
import cors from "cors";
import { createProxyMiddleware } from "http-proxy-middleware";

const app = express();

app.use(express.json());
app.use(morgan("combined"));
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

// Health routes
app.get("/api/status/healthz", (req, res) => {
  res.status(200).json({ status: "healthy" });
});

app.get("/api/status/readyz", (req, res) => {
  res.status(200).json({ status: "ready" });
});


const proxies = {}

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

// Proxy routes
app.use((req, res, next) => {
  const host = req.headers.host;
  const sandboxId = host.split(".")[0];

  const target = `http://sandbox-service-${sandboxId}`;

  console.log(`routing to ${target}`);

  return getProxy(sandboxId)(req, res, next);
});

export default app;