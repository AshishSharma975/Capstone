import { Router } from "express";
import codeAgent from "../agents/code.agent.js";

const agentRouter = Router();

agentRouter.post("/invoke", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        error: "message is required",
      });
    }

   const result = await codeAgent.invoke({
  messages: [
    {
      role: "user",
      content: message,
    },
  ],
},{
  recursionLimit: 10,
});

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: error.message,
    });
  }
});

export default agentRouter;