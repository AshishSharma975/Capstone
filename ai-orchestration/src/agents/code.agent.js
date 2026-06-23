import "dotenv/config";
import { ChatMistralAI } from "@langchain/mistralai";
import { HumanMessage } from "@langchain/core/messages";

import {
  listFiles,
  readFiles,
  updateFilesDirect,
} from "./tools.js";

const model = new ChatMistralAI({
  model: "mistral-large-latest",
  apiKey: process.env.MISTRAL_API_KEY,
});

try {
  const files = await listFiles.invoke({});

  console.log("FILES:");
  console.log(files);

  const projectFiles = await readFiles.invoke({
    files: ["src/App.jsx", "src/App.css"],
  });

  const response = await model.invoke([
    new HumanMessage(`
You are a senior React developer.

Project files:

${projectFiles}

Task:
Update the theme of the project to a modern dark theme.

RULES:
1. Return ONLY valid React JSX code.
2. No explanation.
3. No markdown.
4. No css.
5. No backticks.
6. Start with import.
7. End with export default App;
`)
  ]);

  let updatedCode =
    typeof response.content === "string"
      ? response.content
      : Array.isArray(response.content)
      ? response.content.map((x) => x.text || "").join("\n")
      : String(response.content);

  updatedCode = updatedCode
    .replace(/```jsx/g, "")
    .replace(/```js/g, "")
    .replace(/```/g, "")
    .trim();

  const startIndex = updatedCode.indexOf("import");

  if (startIndex !== -1) {
    updatedCode = updatedCode.slice(startIndex);
  }

  const endIndex = updatedCode.lastIndexOf("export default App;");

  if (endIndex !== -1) {
    updatedCode = updatedCode.slice(
      0,
      endIndex + "export default App;".length
    );
  }

  console.log("CODE LENGTH:", updatedCode.length);

  const updateResult = await updateFilesDirect([
    {
      path: "src/App.jsx",
      content: updatedCode,
    },
  ]);

  console.log("UPDATE RESULT:");
  console.log(updateResult);

} catch (err) {
  console.error("AGENT ERROR:");
  console.error(err);
}