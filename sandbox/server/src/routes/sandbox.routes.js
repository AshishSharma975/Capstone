import { Router } from "express";
import fs from "fs";
import { createPod } from "../kubernetes/pod.js";
import { createService } from "../kubernetes/service.js";
import { cleanupOldSandboxes } from "../kubernetes/cleanup.js";
import {v7 as uuid} from "uuid"
import { createSandboxKey } from "../config/redis.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import project from "../models/project.model.js";
import ProjectFile from "../models/projectFile.model.js";

const router = Router();


router.post("/project",authMiddleware,async(req,res)=>{
   try {
    const{title} = req.body
    if(!title){
        return res.status(400).json({message:'Title is required'})
    }
    const existingProject = await project.findOne({title,user:req.user.id})
    if(existingProject){
        return res.status(400).json({message:'Project already exists'})
    }
    const newProject = new project({
        title,
        user:req.user.id
    })
    await newProject.save()
    return res.status(201).json({message:'Project created successfully',newProject})
   } catch (error) {
    console.log(error)
    return res.status(500).json({message:'Internal server error'})
   }
})

router.get("/projects",authMiddleware,async(req,res)=>{
    try {
        const projects = await project.find({user:req.user.id})
        return res.status(200).json({message:'Projects fetched successfully',projects})
    } catch (error) {
        console.log(error)
        return res.status(500).json({message:'Internal server error'})
    }
})

router.post("/start", authMiddleware, async (req, res) => {
    try {
     const projectId = req.body?.projectId;

     let existingProject = null;
     if (projectId) {
         existingProject = await project.findOne({_id:projectId,user: req.user.id});
     } else {
         // Auto-create a default project if none is specified
         existingProject = new project({
             title: "Default Project",
             user: req.user.id
         });
         await existingProject.save();
     }
     
     if(!existingProject){
        return res.status(400).json({message:'This project does not belong to you.'})
     }

     
        const sandboxId = uuid();
        await cleanupOldSandboxes(0).catch(err => console.error("Cleanup failed:", err));

        await Promise.all([
            createPod(sandboxId, existingProject._id.toString()),
            createService(sandboxId),
            createSandboxKey(sandboxId)
        ]);

        console.log("sandbox environment is created successfully");

        return res.status(201).json({
            message: "sandbox environment is created successfully",
            sandboxId,
            previewUrl: `http://${sandboxId}.preview.localhost`
        });

    } catch (error) {
        console.error("FULL ERROR =>", error);
        try { fs.appendFileSync('error.log', '\n' + new Date().toISOString() + ' ERROR: ' + (error.stack || error.message) + '\n'); } catch (e) {}

        let errorMessage = error.message;
        if (errorMessage && (errorMessage.includes('actively refused') || errorMessage.includes('ECONNREFUSED') || errorMessage.includes('connectex'))) {
            errorMessage = "Kubernetes cluster is not running. Please start Docker Desktop before starting the sandbox.";
        }

        return res.status(500).json({
            message: errorMessage,
            stack: error.message
        });
    }
});

// Sync Routes for Sync-Agent
router.post("/sync/upload", async (req, res) => {
    try {
        const { projectId, filePath, content, isDeleted } = req.body;
        if (!projectId || !filePath) {
            return res.status(400).json({ message: "projectId and filePath are required" });
        }

        if (isDeleted) {
            await ProjectFile.findOneAndUpdate(
                { projectId, filePath },
                { isDeleted: true },
                { upsert: true }
            );
        } else {
            await ProjectFile.findOneAndUpdate(
                { projectId, filePath },
                { content, isDeleted: false },
                { upsert: true }
            );
        }

        return res.status(200).json({ message: "Synced successfully" });
    } catch (error) {
        console.error("Sync Upload Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

router.get("/sync/download/:projectId", async (req, res) => {
    try {
        const { projectId } = req.params;
        const files = await ProjectFile.find({ projectId, isDeleted: false });
        return res.status(200).json({ files });
    } catch (error) {
        console.error("Sync Download Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

router.delete("/project/:id", authMiddleware, async (req, res) => {
    try {
        const projectId = req.params.id;
        const existingProject = await project.findOne({ _id: projectId, user: req.user.id });
        if (!existingProject) {
            return res.status(404).json({ message: "Project not found or not authorized" });
        }
        await project.deleteOne({ _id: projectId });
        await ProjectFile.deleteMany({ projectId });
        return res.status(200).json({ message: "Project deleted successfully" });
    } catch (error) {
        console.error("Delete project error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

export default router;