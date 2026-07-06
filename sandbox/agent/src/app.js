import express from "express";
import morgan from "morgan";
import fs from "fs";
import path from "path";
import {Server} from "socket.io";
import http from "http";
import pty from "node-pty";
import os from "os";

const WORKING_DIR = process.env.WORKING_DIR || (os.platform() === 'win32' ? process.cwd() : '/workspace');


const app = express();
const httpServer = http.createServer(app);

app.use(morgan('dev'));
app.use(
  express.json({
    limit: "50mb",
  })
);

const io = new Server(httpServer,{
    cors:{
        origin: "*",
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    },
    // Increase timeouts so connections don't drop through nginx reverse proxy
    pingTimeout: 60000,      // 60s before considering connection dead
    pingInterval: 25000,     // ping every 25s
    transports: ['websocket', 'polling'],  // server supports both, client forces websocket
    allowUpgrades: true,
})



app.use(
  express.urlencoded({
    extended: true,
    limit: "50mb",
  })
);

app.get("/",(req,res)=>{
    return res.status(200).json({
        message:"Agent is running successfully",
        status:"success",
        timestamp: new Date().toISOString()
    })
})



const osPlatform = os.platform();
const shell = osPlatform === 'win32' ? 'powershell.exe' : (process.env.SHELL || "/bin/bash");

const ptyProcess = pty.spawn(shell, [], {
    name: "xterm-256color",
    cols: 80,
    rows: 24,
    cwd: WORKING_DIR,
    env: {
        ...process.env,
        TERM: "xterm-256color",
    },
});


ptyProcess.onData((data)=>{
    io.emit("terminal-output",data);
})

ptyProcess.onExit((code,signal)=>{
    console.log("Terminal process is exited",code,signal);
})


io.on("connection", (socket) => {
    console.log("User is connected:", socket.id);

    socket.on("terminal-input", (data) => {
        if (ptyProcess) {
            ptyProcess.write(data);
        }
    });

    socket.on("disconnect", () => {
        console.log("User is disconnected:", socket.id);
    });
});




app.get("/list-files", async (req, res) => {

    const listFiles = async (dir, baseDir) => {
        const entries = await fs.promises.readdir(dir, { withFileTypes: true });
        const files = [];

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            const relativePath = path.relative(baseDir, fullPath);

            // Exclude certain directories
            if (entry.isDirectory() && [ 'node_modules', '.git', 'dist' ].includes(entry.name)) {
                continue;
            }

            if (entry.isDirectory()) {
                files.push(...await listFiles(fullPath, baseDir));
            } else {
                files.push(relativePath);
            }
        }

        return files;
    }

    try {
        const files = await listFiles(WORKING_DIR, WORKING_DIR);
        res.status(200).json({
            message: 'Files listed successfully',
            files,
        });
    } catch (err) {
        res.status(500).json({
            message: `Error listing files: ${err.message}`,
            status: 'error',
        });
    }

})


app.get("/read-files", async (req, res) => {

    const files = req.query.files;

    if (!files) {
        return res.status(400).json({
            message: 'No files specified in query parameter',
            status: 'error',
        });
    }

    const fileList = files.split(',');

    const results = await Promise.all(fileList.map(async (file) => {
        const filePath = path.join(WORKING_DIR, file);
        try {
            const content = await fs.promises.readFile(filePath, 'utf-8');
            return {
                [ filePath.replace(WORKING_DIR, '') ]: content,
            }
        } catch (err) {
            return {
                [ filePath.replace(WORKING_DIR, '') ]: `Error reading file: ${err.message}`,
            }
        }
    }));

    res.status(200).json({
        message: 'File contents',
        files: results,
    });

})


app.patch("/update-files", async (req, res) => {
    try {
        console.log("REQ BODY =", JSON.stringify(req.body, null, 2));

        const updates = req.body.updates;

        if (!updates || !Array.isArray(updates)) {
            return res.status(400).json({
                message: 'Invalid request body. Expected "updates" array.',
                status: 'error',
            });
        }

        const results = await Promise.all(
            updates.map(async (update) => {
                // ... same inside loop, but we also check if package.json was updated
                console.log("UPDATE =", update);
                const file = update.file || update.path || update.name || update.filename;
                let content = update.content || "";
                
                // Fix double-escaped newlines/tabs from LLM hallucination
                if (typeof content === 'string') {
                    content = content.replace(/\\n/g, '\n').replace(/\\t/g, '\t');
                }

                if (!file) return { error: "Missing file/path/name/filename", received: update };
                const filePath = path.join(WORKING_DIR, file);
                try {
                    await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
                    await fs.promises.writeFile(filePath, content, "utf8");
                    return { [file]: "updated successfully", fileUpdated: file };
                } catch (err) {
                    return { [file]: err.message };
                }
            })
        );

        // Check if package.json was updated
        const packageJsonUpdated = results.some(r => r.fileUpdated === "package.json");
        if (packageJsonUpdated) {
            console.log("package.json was updated, running npm install...");
            const cp = await import("child_process");
            await new Promise((resolve, reject) => {
                cp.exec("npm install", { cwd: WORKING_DIR }, async (error, stdout, stderr) => {
                    if (error) console.error("npm install failed:", error);
                    else console.log("npm install successful:", stdout);
                    
                    // Touch vite.config.js to force Vite to restart and pick up new dependencies
                    try {
                        const viteConfigPath = path.join(WORKING_DIR, "vite.config.js");
                        const now = new Date();
                        await fs.promises.utimes(viteConfigPath, now, now);
                        console.log("Touched vite.config.js to restart Vite");
                    } catch (e) {
                        console.error("Failed to touch vite.config.js", e);
                    }
                    resolve();
                });
            });
        }

        return res.status(200).json({
            message: "File update results",
            results
        });

    } catch (error) {
        console.error("UPDATE ERROR =", error);

        return res.status(500).json({
            message: error.message
        });
    }
});



app.post("/create-files", async (req, res) => {
    try {
        console.log("REQ BODY =", JSON.stringify(req.body, null, 2));

        const files = req.body.files;

        if (!files || !Array.isArray(files)) {
            return res.status(400).json({
                message: 'Invalid request body. Expected "files" array.',
                status: 'error',
                received: req.body
            });
        }

        const results = await Promise.all(
            files.map(async (fileObj) => {

                console.log("FILE OBJ =", fileObj);

                const file =
                    fileObj.file ||
                    fileObj.path ||
                    fileObj.name ||
                    fileObj.filename;

                let content = fileObj.content || "";

                // Fix double-escaped newlines/tabs from LLM hallucination
                if (typeof content === 'string') {
                    content = content.replace(/\\n/g, '\n').replace(/\\t/g, '\t');
                }

                if (!file || typeof file !== "string") {
                    return {
                        error: "Missing file/path/name/filename property",
                        received: fileObj
                    };
                }

                const filePath = path.join(WORKING_DIR, file);

                try {
                    await fs.promises.mkdir(
                        path.dirname(filePath),
                        { recursive: true }
                    );

                    await fs.promises.writeFile(
                        filePath,
                        content,
                        "utf8"
                    );

                    return {
                        file: file,
                        status: "created"
                    };

                } catch (err) {
                    return {
                        file: file,
                        status: "error",
                        error: err.message
                    };
                }
            })
        );

        return res.status(200).json({
            message: "File creation completed",
            results
        });

    } catch (error) {
        console.error("CREATE FILE ERROR:", error);

        return res.status(500).json({
            message: error.message,
            status: "error"
        });
    }
});
export default httpServer;
