import { Router } from "express";
import codeAgent from "../agents/code.agent.js";

const agentRouter = Router();



agentRouter.post("/invoke", async (req, res) => {
  let pingInterval;
  try {
    console.log("STEP 1: Request received");

    let { message, projectId } = req.body;
    if (!projectId) projectId = "019ef519-b572-746d-bab1-b2385dc50396";

    console.log("STEP 2: Before invoke");

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    // Disable socket timeout to prevent the connection from closing during long LLM tasks
    req.socket.setTimeout(0);

    if (res.flushHeaders) {
      res.flushHeaders();
    }

    // Optional: send an initial event so Postman knows the stream started
    res.write(`data: ${JSON.stringify({ type: "start", message: "Agent started..." })}\n\n`);
    if (res.flush) res.flush();

    pingInterval = setInterval(() => {
      res.write(`data: ${JSON.stringify({ type: "ping" })}\n\n`);
    }, 15000);

    const result = await codeAgent.invoke(
      {
        messages: [
          {
            role: "user",
            content: message,
          },
        ],
      },
      {
        timeout: 600000,
        recursionLimit: 100,
        context: {
          projectId,
          writer: {
            write: (stepMessage) => {
              // Send the tool progress step as an SSE event
              res.write(`data: ${JSON.stringify({ type: "step", message: stepMessage })}\n\n`);
              if (res.flush) res.flush();
            }
          }
        }
      }
    );

    console.log("STEP 3: After invoke");
    clearInterval(pingInterval);
    // Send final result and close stream
    res.write(`data: ${JSON.stringify({ type: "complete", result: result.messages })}\n\n`);
    return res.end();
  } catch (error) {
    console.error("STEP 4 ERROR:", error);
    if (pingInterval) clearInterval(pingInterval);

    // Stream is already open, so we must send error as SSE event rather than JSON
    if (!res.headersSent) {
      return res.status(500).json({ error: error.message });
    } else {
      res.write(`data: ${JSON.stringify({ type: "error", message: error.message })}\n\n`);
      return res.end();
    }
  }
});

export default agentRouter;