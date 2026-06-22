import express from "express";
import morgan from "morgan";

const app = express();

app.use(morgan("dev"));
app.use(express.json());



app.get("/api/ai/healthz",(req,res)=>{
    res.status(200).json({
        status:"AI Orchestration Engine is running!",
        timestamp:new Date().toISOString(),
        version:"1.0.0"
    })
})




export default app;




