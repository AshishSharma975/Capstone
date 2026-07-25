import jwt from "jsonwebtoken";

export function verifyToken(token){
    try{
        return jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey123')
    }catch(error){
        console.log(error)
        return null;
    }
}