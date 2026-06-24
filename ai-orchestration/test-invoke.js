import "dotenv/config";
import codeAgent from "./src/agents/code.agent.js";

try {
  console.log("Invoking agent...");
  const result = await codeAgent.invoke(
    {
      messages: [
        {
          role: "user",
          content: "change src/App.jsx and show Hello Ashish",
        },
      ],
    },
    {
      recursionLimit: 10,
    }
  );
  console.log("Success:", result);
} catch (error) {
  console.error("Error occurred:", error);
}
