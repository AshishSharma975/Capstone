import { Router } from "express";
import codeAgent from "../agents/code.agent.js";

const agentRouter = Router();

agentRouter.post("/invoke", async (req, res) => {
  try {
    console.log("STEP 1: Request received");

    let { message, projectId } = req.body;
    if (!projectId) projectId = "019ef519-b572-746d-bab1-b2385dc50396";

    console.log("STEP 2: Before invoke");

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
          projectId
        }
      }
    );

    console.log("STEP 3: After invoke");
    console.log(JSON.stringify(result,null,2))
    return res.json(result.messages);
  } catch (error) {
    console.error("STEP 4 ERROR:", error);

    return res.status(500).json({
      error: error.message,
    });
  }
});

export default agentRouter;