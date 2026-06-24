import "dotenv/config";
import { ChatMistralAI } from "@langchain/mistralai";
import { createAgent } from "langchain";

import {
  listFiles,
  readFiles,
  updateFilesTool,
} from "./tools.js";

const model = new ChatMistralAI({
  model: "codestral-latest",
  apiKey: process.env.MISTRAL_API_KEY,
  temperature: 0,
  maxTokens: 4096,
});

const codeAgent = createAgent({
  model,
  tools: [
    listFiles,
    readFiles,
    updateFilesTool,
  ],
  systemPrompt: `
You are a coding agent.

When a user asks for a code change:

1. List files if needed.
2. Read files if needed.
3. Update files if needed.

After updating files, STOP.

Return a short confirmation message.

Do not call any more tools after files are updated.
`,
});

export default codeAgent;