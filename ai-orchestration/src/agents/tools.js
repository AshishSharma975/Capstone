import axios from "axios";
import { tool } from "@langchain/core/tools";
import * as z from "zod";

const BASE_URL = "http://router-service";

// ================= LIST FILES =================

export const listFiles = tool(
  async ({},config) => {


    const writer = config.writer;

    writer.write("listing files in project directory...\n");

    const HOST = `${config.context.projectId}.agent.localhost`;
    try {
      console.log("===========");
      console.log("LIST FILES TOOL");
      console.log("===========");

      const response = await axios.get(
        `${BASE_URL}/list-files`,
        {
          headers: {
            Host: HOST,
          },
        }
      );

      return JSON.stringify(response.data);
    } catch (error) {
      console.error("LIST FILES ERROR:", error.message);

      return JSON.stringify({
        success: false,
        error: error.message,
      });
    }
  },
  {
    name: "listFiles",
    description:
      "List all project files. Always use this before reading files.",
    schema: z.object({}),
  }
);

// ================= READ FILES =================

export const readFiles = tool(

  async (input,config) => {

    const writer = config.writer;

    writer.write("Reading files from project directory...\n");


    const HOST = `${config.context.projectId}.agent.localhost`;
    try {
      let files = [];

      if (input?.files) {
        files = input.files;
      }

      console.log("FILES =", files);

      if (!files.length) {
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
      console.error("READ FILES ERROR:", error.message);

      return JSON.stringify({
        success: false,
        error: error.message,
      });
    }
  },
  {
    name: "readFiles",
    description:
      "Read project files. Example: { files: ['src/App.jsx'] }",
    schema: z.object({
      files: z.array(z.string()),
    }),
  }
);

// ================= DIRECT UPDATE =================

async function updateFilesDirect(files,config) {

   const writer = config.writer;

  writer.write("Updating files in project directory...\n");

  const HOST = `${config.context.projectId}.agent.localhost`;
  const response = await axios.patch(
    `${BASE_URL}/update-files`,
    {
      updates: files,
    },
    {
      timeout: 300000,
      headers: {
        Host: HOST,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
}

// ================= UPDATE FILES TOOL =================

export const updateFilesTool = tool(


  async ({ files },config) => {

     const writer = config.writer;

    writer.write("Updating files in project directory...\n");

    
    try {
      console.log("===============");
      console.log("UPDATE FILES TOOL");
      console.log(files);
      console.log("===============");

      const result = await updateFilesDirect(files,config);

      return JSON.stringify(result);
    } catch (error) {
      console.error("UPDATE FILES ERROR:", error.message);

      return JSON.stringify({
        success: false,
        error: error.message,
      });
    }   
  },
  {
    name: "updateFiles",
    description:
      "Update project files with generated content.",
    schema: z.object({
      files: z.array(
        z.object({
          file: z.string(),
          content: z.string(),
        })
      ),
    }),
  }
);