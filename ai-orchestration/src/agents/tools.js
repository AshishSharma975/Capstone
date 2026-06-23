import axios from "axios";
import { tool } from "@langchain/core/tools";
import * as z from "zod";

const BASE_URL = "http://127.0.0.1";
const HOST = "019ef519-b572-746d-bab1-b2385dc50396.agent.localhost";

export const listFiles = tool(
  async () => {
    try {
      console.log("===========");
      console.log("using listFiles tool");
      console.log("===========");

      const response = await axios.get(
        `${BASE_URL}/list-files`,
        {
          headers: {
            Host: HOST,
          },
        }
      );

      return JSON.stringify({
        files: response.data.files,
      });
    } catch (error) {
      return JSON.stringify({
        success: false,
        error: error.message,
      });
    }
  },
  {
    name: "listFiles",
    description:
      "List all files available in the project. Always call this before reading files.",
    argsSchema: z.object({}),
  }
);

export const readFiles = tool(
  async ({ files }) => {
    try {
      if (!files || files.length === 0) {
        return JSON.stringify({
          success: false,
          error: "No files provided",
        });
      }

      const response = await axios.get(
        `${BASE_URL}/read-files?files=${files.join(",")}`,
        {
          headers: {
            Host: HOST,
          },
        }
      );

      return JSON.stringify(response.data);
    } catch (error) {
      return JSON.stringify({
        success: false,
        error: error.message,
      });
    }
  },
  {
    name: "readFiles",
    description:
      "Read files. Example: { files: ['src/App.jsx','src/App.css'] }",
    argsSchema: z.object({
      files: z.array(z.string()),
    }),
  }
);

export async function updateFilesDirect(files) {
  const response = await axios.patch(
    `${BASE_URL}/update-files`,
    {
      updates: files,
    },
    {
      timeout: 300000,
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
      headers: {
        Host: HOST,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
}

export const updateFilesTool = tool(
  async ({ files }) => {
    try {
      const result = await updateFilesDirect(files);

      return JSON.stringify(result);
    } catch (error) {
      return JSON.stringify({
        success: false,
        error: error.message,
      });
    }
  },
  {
    name: "updateFiles",
    description: "Update files in the project workspace.",
    argsSchema: z.object({
      files: z.array(
        z.object({
          file: z.string(),
          content: z.string(),
        })
      ),
    }),
  }
);