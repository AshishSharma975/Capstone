import express from "express"
import morgan from "morgan"
import { createPod } from "./kubernetes/pod.js";
import { createService } from "./kubernetes/service.js";
import {v7 as uuid} from "uuid"

const app = express();

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }))

app.get("/api/sandbox/health", (req, res) => {
    res.status(200).json({
        message: "OK",
        status: 200,
        timestamp: new Date().toISOString()
    });
}); 

app.post("/api/sandbox/start", async (req, res) => {
    try {
        const sandboxId = uuid();

        await Promise.all([
            createPod(sandboxId),
            createService(sandboxId)
        ]);

        console.log("sandbox environment is created successfully");

        return res.status(201).json({
            message: "sandbox environment is created successfully",
            sandboxId,
            previewUrl: `http://${sandboxId}.preview.localhost`
        });

    } catch (error) {
        console.error("FULL ERROR =>", error);

        return res.status(500).json({
            message: error.message
        });
    }
});


export default app;
