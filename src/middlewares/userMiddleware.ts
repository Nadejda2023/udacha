import { Response, Request, NextFunction } from "express";
import { UserModel } from "../db/db";
import { jwtService } from "../_application/jwt-service";

export const userMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { authorization } = req.headers;
        
        if (!authorization || !authorization.startsWith('Bearer')) {
            return next(); 
        }

        const token = authorization.split(' ')[1];
        const userId = await jwtService.getUserIdByToken(token);
        
        if (!userId) {
            return next(); 
        }

        const user = await UserModel.findOne({ id: userId });

        if (user) {
            req.user = user;
        }

        next(); 
    } catch (error) {
        console.error("Error in userMiddleware:", error);
        next(error);
    }
};
