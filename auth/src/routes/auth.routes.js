import { Router } from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { sendAuthNotification } from "../config/mq.js";
const router = Router();




router.get("/google", passport.authenticate('google',{scope:['profile','email'], session: false}));


router.get('/google/callback',passport.authenticate('google',{failureRedirect:'/', session: false}),async(req,res)=>{
try{
    const {id,displayName,emails,photos} = req.user;
    let user = await User.findOne({googleId:id})
    if (!user){
        user = new User({
            googleId:id,
            email:emails[0].value,
            name:displayName,
            avatar:photos[0].value
        })
        await user.save()
        // sendNotification
        await sendAuthNotification({
            type:'USER_CREATED',
            data: {
                name:user.name,
                email:user.email,
                avatar:user.avatar,
            },
            userId:user._id
        })
    } else {
        await sendAuthNotification({
            type:'USER_LOGGED_IN',
            data: {
                name:user.name,
                email:user.email,
                avatar:user.avatar,
            },
            userId:user._id
        })
    }
    const payload = {
        id:user._id,
        email:user.email,
        name:user.name,
    }
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'supersecretkey123', {
        expiresIn:'7d'
    })
    res.cookie('token',token,{
        httpOnly:true,
        secure: false,
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax'
    })
    res.redirect(process.env.CLIENT_URL || 'http://localhost:5173/')
}catch(error){
    console.log(error)
    res.status(500).json({success:false,message:"Internal Server Error",error:error.message})
}    
})
export default router