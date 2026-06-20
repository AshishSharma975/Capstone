import express from "express";
import morgan from "morgan";
import fs from "fs";
import path from "path";

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

const listFiles = async (dir, baseDir)=>{
    const entries = await fs.promises.readdir(dir, { withFileTypes: true });
    const files = [];

    for(const entry of entries){
        const fullPath = path.join(dir, entry.name);
        const relativePath = path.relative(baseDir, fullPath);

        // exclude certain directry
        if(entry.isDirectory() && ['node_modules','git','dist'].includes(entry.name)){
            continue;
        }

        if(entry.isDirectory()){
            const children = await listFiles(fullPath,baseDir)
            files.push({
                name:relativePath,
                type:"directory",
                children
            })
        }else{
            files.push({
                name:relativePath,
                type:"file"
            })
        }
    }

    return files
}

    const tree = await listFiles(WORKING_DIR,"/")
    return res.status(200).json({
        message:"files listed successfully",
        data:tree
    })
})


app.get("/read-files",async(req,res)=>{
    const files = req.query.files

    if(!files){
        return res.status(400).json({
            message:"files is required",
            status:"error"
        })
    }


    const filelist = files.split(",");

    const fileContents = {}

    await Promise.all(
        filelist.map(async(file)=>{
            const filePath = `${WORKING_DIR}/${file}`

            const stats = await fs.promises.stat(filePath)

            if(!stats.isFile()){
                throw new Error(`file not found ${file}`)
            }
            
            const content = await fs.promises.readFile(filePath,"utf-8")

            fileContents[file] = content
        })
    )


    return res.status(200).json({
        message:"files read successfully",
        data:fileContents
    })
})


app.patch("/update-files",async(req,res)=>{

    const updates = req.body.updates

    if(!updates){
        return res.status(400).json({
            message:"updates is required",
            status:"error"
        })
    }

    const fileUpdated = {}

   const result =  await Promise.all(
        updates.map(async(update)=>{
            const filePath = path.join(WORKING_DIR,update.name)
            console.log(filePath)
            const stats = await fs.promises.stat(filePath)

            if(!stats.isFile()){
                throw new Error(`file not found ${update.name}`)
            }

            await fs.promises.writeFile(filePath,update.content)

            fileUpdated[update.name] = true
        })
    )

    return res.status(200).json({
        message:"files updated successfully",
        data:fileUpdated,
        result
    })
})

app.post("/create-files",async(req,res)=>{
    const files = req.body.files

    if(!files){
        return res.status(400).json({
            message:"files is required",
            status:"error"
        })
    }

    const fileUpdated = {}

   const result =  await Promise.all(
        files.map(async(file)=>{
            const filePath = path.join(WORKING_DIR,file.name)
            console.log(filePath)
            const stats = await fs.promises.stat(filePath)

            if(!stats.isFile()){
                throw new Error(`file not found ${file.name}`)
            }

            await fs.promises.writeFile(filePath,file.content)

            fileUpdated[file.name] = true
        })
    )

    return res.status(200).json({
        message:"files created successfully",
        data:fileUpdated,
        result
    })
})

export default app;
