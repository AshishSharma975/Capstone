import dotenv from "dotenv";
dotenv.config();
import app from "./src/app.js";


const PORT = process.env.PORT || 6000;

const server = app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
});
server.setTimeout(600000);

