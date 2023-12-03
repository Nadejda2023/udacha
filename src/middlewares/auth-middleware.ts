import {Response, Request, NextFunction } from "express";
import { UserModel } from "../db/db";
import { jwtService } from "../_application/jwt-service";



export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    if(!req.headers.authorization) {
        res.sendStatus(401);
        return;
    }
const typeAuth = req.headers.authorization.split(' ')[0]
if(typeAuth !== 'Bearer') return res.sendStatus(401);

    const token = req.headers.authorization.split(' ')[1]

    const userId = await jwtService.getUserIdByToken(token)
    
    if (!userId) {
        res.sendStatus(401)
        return  
        
    }
    
    const user = await UserModel.findOne({id: userId})
    
    if(!user) {
        res.sendStatus(401)
        return
    }

    req.user = user
    next()
    return;
    

}