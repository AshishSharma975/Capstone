import mongoose from "mongoose";


export const connectDB = async () =>{
    try{
        await mongoose.connect(process.env.AUTH_MONGO_URI,{})
        console.log("MongoDB Connected")
    }catch(error){
        console.error(error.message)
        process.exit(1)
    }
}
