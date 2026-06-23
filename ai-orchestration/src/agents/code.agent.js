import "dotenv/config";
import { ChatMistralAI } from "@langchain/mistralai";
import { createAgent } from "langchain";

import {
  listFiles,
  readFiles,
  updateFilesTool,
} from "./tools.js";

const model = new ChatMistralAI({
  model: "mistral-large-latest",
  apiKey: process.env.MISTRAL_API_KEY,
});

const codeAgent = createAgent({
  model,
  tools: [
    listFiles,
    readFiles,
    updateFilesTool,
  ],
});

export default codeAgent;