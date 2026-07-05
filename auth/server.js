import app from "./src/app";
import { connectDB } from "./src/config/db";


connectDB();
app.listen(3000,()=>{
    console.log(" Auth Server is running on port 3000");
})