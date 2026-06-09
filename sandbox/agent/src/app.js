import express from "express";
import morgan from "morgan";
import fs from "fs";



const WORKING_DIR = '/workspace'


const app = express();

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/",(req,res)=>{
    return res.status(200).json({
        message:"Agent is running successfully",
        status:"success",
        timestamp: new Date().toISOString()
    })
})


app.get("/list-files",async(req,res)=>{

    const {sandboxId} = req.query;
    const files =  await fs.promises.readdir(`${WORKING_DIR}/${sandboxId}`); 

    return res.status(200).json({
        message:"files fetched successfully",
        data:files
    })
})

export default app;
