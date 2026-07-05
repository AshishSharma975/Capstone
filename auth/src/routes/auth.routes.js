import { Router } from "express";
import passport from "passport";
import User from "../models/user.model";

const router = Router();




router.get("/google", passport.authenticate('google',{scope:['profile','email']}));


router.get('/google/callback',passport.authenticate('google',{failureRedirect:'/'}),async(req,res)=>{
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
    }
    const payload = {
        id:user._id,
        email:user.email,
        name:user.name,
    }
    const token = jwt.sign(payload,process.env.JWT_SECRET,{
        expiresIn:'1h'
    })
    res.cookie('token',token,{
        httpOnly:true,
        secure:true,
        sameSite:'strict'
    })
    res.redirect('/')
}catch(error){
    console.log(error)
    res.status(500).json({success:false,message:"Internal Server Error",error:error.message})
}    
})
export default router