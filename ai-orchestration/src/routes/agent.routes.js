import { Router } from "express";
import codeAgent from "../agents/code.agent.js";

const agentRouter = Router();

agentRouter.post("/invoke", async (req, res) => {
  try {

    const { message } = req.body;

    const result = await codeAgent.invoke({
      messages: [
        {
          role: "user",
          content: message,
        },
      ],
    });

    res.json(result);

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

export default agentRouter;