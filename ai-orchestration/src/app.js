import express from "express";
import morgan from "morgan";
import agentRouter from "./routes/agent.routes.js";
const app = express();

app.use(morgan("dev"));
app.use(express.json());



app.get("/api/status/healthz",(req,res)=>{
    res.status(200).json({
        status:"AI Orchestration Engine is running!",
        timestamp:new Date().toISOString(),
        version:"1.0.0"
    })
})

app.get("/api/ai/healthz",(req,res)=>{
    res.status(200).json({
        status:"AI Orchestration Engine is running!",
        timestamp:new Date().toISOString(),
        version:"1.0.0"
    })
})

app.use("/api/ai",agentRouter)

export default app;




