import { verifyToken } from "../models/utils.js";

export function authMiddleware(req,res,next) {
    try{
        const token = req.cookies.token || req.headers.authorization?.split(' ')[1]

        if(!token){
            return res.status(401).json({message:'Unauthorized', debugCookies: req.cookies, debugHeaders: req.headers})
        }

        const decodedToken = verifyToken(token)

        if(!decodedToken){
            return res.status(401).json({message:'Invalid Token'})
        }

        req.user = decodedToken

        next()
    }catch(error){
        console.log("AUTH ERROR =>", error);
        import('fs').then(fs => fs.appendFileSync('auth_error.log', '\n' + new Date().toISOString() + ' ERROR: ' + (error.stack || error.message) + '\n')).catch(()=>{});
        return res.status(500).json({message:'Internal Server Error from Auth'})
    }
}