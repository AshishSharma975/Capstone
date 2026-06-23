import axios from "axios";
import { tool } from "@langchain/core/tools";
import * as z from "zod";

const BASE_URL = "http://127.0.0.1";
const HOST = "019ee8b5-dfe7-7318-a380-f1581fbfce85.agent.localhost";

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

      console.log("STATUS:", response.status);
      console.log("DATA:", response.data);

      return JSON.stringify({
        files: response.data.files,
      });
    } catch (error) {
      console.error("LIST FILES ERROR:");

      if (error.response) {
        console.error(error.response.data);
      } else {
        console.error(error.message);
      }

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
    console.log("FILES:", files);

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

export const UpdateFiles = tool(
  async (input = {}) => {
    try {
      const files = input.files || [];

      console.log("===========");
      console.log("using updateFiles tool");
      console.log("UPDATES:", files);
      console.log("===========");

      if (!files || files.length === 0) {
        return JSON.stringify({
          success: false,
          error: "files array is empty",
        });
      }

      const response = await axios.patch(
        `${BASE_URL}/update-files`,
        {
          updates: files,
        },
        {
          headers: {
            Host: HOST,
          },
        }
      );

      console.log("STATUS:", response.status);
      console.log("DATA:", response.data);

      return JSON.stringify(response.data);
    } catch (error) {
      console.error("UPDATE FILES ERROR:");

      if (error.response) {
        console.error(error.response.data);
      } else {
        console.error(error.message);
      }

      return JSON.stringify({
        success: false,
        error: error.message,
      });
    }
  },
  {
    name: "updateFiles",
    description:
      "Update files in the project. Requires files array with path and content.",
    argsSchema: z.object({
      files: z.array(
        z.object({
          path: z.string(),
          content: z.string(),
        })
      ),
    }),
  }
);