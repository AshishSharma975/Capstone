import "dotenv/config";
import { ChatMistralAI } from "@langchain/mistralai";
import { createAgent } from "langchain";

import {
  listFiles,
  readFiles,
  updateFilesTool,
} from "./tools.js";

const model = new ChatMistralAI({
  model: "ministral-3b-latest",
  apiKey: process.env.MISTRAL_API_KEY,
  temperature: 0,
  maxTokens: 1000,
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

ALWAYS:
1. listFiles
2. readFiles
3. updateFiles

Do NOT explain code.
Do NOT return code in chat.
Only modify files using updateFiles tool.
`,
});

export default codeAgent;