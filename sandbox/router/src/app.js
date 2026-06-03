import express from "express";
import morgan from "morgan";
import { createProxyMiddleware } from "http-proxy-middleware";

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('combined'));


app.use((req,res,next)=>{
    const host = req.headers.host;
    const sandboxId = host.split('.')[0];

    const target = `http://sandbox-pod-${sandboxId}`
    console.log(`routing to ${target}`);
    return createProxyMiddleware({
        target: target,
        changeOrigin: true,
        ws:true,
    })(req,res,next)
});  

app.get("/", (req, res) => {
    res.send("Router is running");
});


export default app

