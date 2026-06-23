import "dotenv/config";
import { ChatMistralAI } from "@langchain/mistralai";
import { HumanMessage } from "@langchain/core/messages";

import { listFiles, readFiles, UpdateFiles } from "./tools.js";

const model = new ChatMistralAI({
  model: "mistral-large-latest",
  apiKey: process.env.MISTRAL_API_KEY,
});

const files = await listFiles.invoke({});
console.log("FILES:", files);

const projectFiles = await readFiles.invoke({
  files: ["src/App.jsx", "src/App.css"],
});

const response = await model.invoke([
  new HumanMessage(`
You are a senior frontend developer.

Project files:
${projectFiles}

Task:
Update the theme of the project to a modern dark theme.

Return ONLY valid React JSX code for App.jsx.
Do not use markdown.
Do not use triple backticks.
`)
]);

await UpdateFiles.invoke({
  files: [
    {
      path: "src/App.jsx",
      content: response.content,
    },
  ],
});

console.log("FILE UPDATED SUCCESSFULLY");