import express from "express";
import morgan from "morgan";
import fs from "fs";
import path from "path";

const WORKING_DIR = '/workspace'


const app = express();

app.use(morgan('dev'));
app.use(
  express.json({
    limit: "50mb",
  })
);

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

                console.log("UPDATE =", update);

                const file =
                    update.file ||
                    update.path ||
                    update.name ||
                    update.filename;

                const content = update.content || "";

                if (!file) {
                    return {
                        error: "Missing file/path/name/filename",
                        received: update
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
                        [file]: "updated successfully"
                    };

                } catch (err) {
                    return {
                        [file]: err.message
                    };
                }
            })
        );

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

                const content = fileObj.content || "";

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
export default app;
