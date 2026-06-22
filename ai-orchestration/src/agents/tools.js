import axios from "axios";
import {tool} from "@langchain/core/tools";
import * as z from "zod";

export const listFiles = tool(
    async({ }) =>{
        const response = await axios.get('http://019ee8b5-dfe7-7318-a380-f1581fbfce85.agent.localhost/list-files');
            return JSON.stringify(response.data.files);
        
    },
    {
        name:"list_files",
        description:"Lists all files in code running environemnt, use it to explore files before reading or writing",
        argsSchema:z.object({
            path:z.array(z.string()).optional(),
        })
    }
)

export const readFiles = tool(
    async({
        files = []
    })=>{
        const response = await axios.get("http://019ee8b5-dfe7-7318-a380-f1581fbfce85.agent.localhost/read-files?files="+files.join(","))
        return JSON.stringify(response.data);
    },
    {
        name:"read_files",
        description:"Reads content from files",
        argsSchema:z.object({
            files:z.array(z.string()).optional(),
        })
    }
)


export const UpdateFiles = tool(
    async ({
        files = []
    })=>{
        const response = await axios.patch("http://019ee8b5-dfe7-7318-a380-f1581fbfce85.agent.localhost/update-files",{updates:files})
        return JSON.stringify(response.data);
    },
    {
        name:"update_files",
        description:"Updates files, use it to write code",
        argsSchema:z.object({
            files:z.array(z.object({
                path:z.string(),
                content:z.string()
            })).optional()
        })
    }
)