import mongoose from "mongoose";

const MAX_RETRIES = 30;
const RETRY_DELAY_MS = 5000;

const connectDB = async (attempt = 1) => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected");
    } catch (error) {
        console.error(`MongoDB connection failed (attempt ${attempt}/${MAX_RETRIES}):`, error.message);
        if (attempt < MAX_RETRIES) {
            console.log(`Retrying in ${RETRY_DELAY_MS / 1000}s...`);
            setTimeout(() => connectDB(attempt + 1), RETRY_DELAY_MS);
        } else {
            console.error("Could not connect to MongoDB after multiple retries.");
        }
    }
}

export default connectDB;