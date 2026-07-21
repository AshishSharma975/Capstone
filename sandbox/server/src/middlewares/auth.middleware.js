import { verifyToken } from "../models/utils";

export function authMiddleware(req,res,next) {
    try{
        const token = req.cookies.token || req.headers.authorization?.split(' ')[1]

        if(!token){
            return res.status(401).json({message:'Unauthorized'})
        }

        const decodedToken = verifyToken(token)

        if(!decodedToken){
            return res.status(401).json({message:'Invalid Token'})
        }

        req.user = decodedToken

        next()
    }catch(error){
        console.log(error)
        return res.status(500).json({message:'Internal Server Error'})
    }
}