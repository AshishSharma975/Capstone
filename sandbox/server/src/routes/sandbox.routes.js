import { Router } from "express";
import { createPod } from "../kubernetes/pod.js";
import { createService } from "../kubernetes/service.js";
import { cleanupOldSandboxes } from "../kubernetes/cleanup.js";
import {v7 as uuid} from "uuid"
import { createSandboxKey } from "../config/redis.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import project from "../models/project.model.js";

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
     const projectId = req.body.projectId;

     const existingProject = await project.findOne({_id:projectId,user: req.user.id})
     
     if(!existingProject){
        return res.status(400).json({message:'This project does not belong to you.'})
     }

     
        const sandboxId = uuid();
        await cleanupOldSandboxes(0).catch(err => console.error("Cleanup failed:", err));

        await Promise.all([
            createPod(sandboxId),
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

        let errorMessage = error.message;
        if (errorMessage && (errorMessage.includes('actively refused') || errorMessage.includes('ECONNREFUSED') || errorMessage.includes('connectex'))) {
            errorMessage = "Kubernetes cluster is not running. Please start Docker Desktop before starting the sandbox.";
        }

        return res.status(500).json({
            message: errorMessage
        });
    }
});

export default router;