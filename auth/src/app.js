import "dotenv/config";
import express from "express"
import cors from "cors"
import morgan from "morgan"
import jwt from "jsonwebtoken"
import passport from "passport"
import { Strategy as GoogleStrategy } from "passport-google-oauth20"
import cookieParser from "cookie-parser"
import authRoutes from "./routes/auth.routes.js"

const app = express();

// CORS — allow frontend and any localhost port, with credentials (cookies)
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(morgan("dev"));
app.use(cookieParser());
app.use(passport.initialize());



passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:5173/api/auth/google/callback"  // must match Google Console
}, (accessToken, refreshToken, profile, done) => {
    return done(null, profile);
}));



app.get("/_status/healthz",(req,res)=>{
    res.status(200).send("OK...")
})
app.get("/_status/readyz",(req,res)=>{
    res.status(200).send("OK...")
})

app.use("/api/auth",authRoutes)



export default app