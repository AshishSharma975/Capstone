import axios from "axios";
import {tool} from "@langchain/core/tools";

export const listFiles = tool(
    async({ }) =>{
        const response = await axios.get('http://019ee8b5-dfe7-7318-a380-f1581fbfce85.agent.localhost/list-files');
            return response.data.files;
        
    },
    {
        name:"list_files",
        description:"Lists all files in code running environemnt, use it to explore files before reading or writing",
    }
)
