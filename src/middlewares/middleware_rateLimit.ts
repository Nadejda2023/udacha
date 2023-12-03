import { Request, Response, NextFunction } from 'express';
import { RateLimitModel } from "../db/db";
import { RateLimitDBModel } from '../models/rateLimitModels';

const maxRequests = 5;
const interval = 10 * 1000;
const connections: RateLimitDBModel[] = []

 export async function customRateLimit(req: Request, res: Response, next: NextFunction) {
  const IP = req.ip;
  const URL = req.originalUrl;
  const date = new Date();

  try {
    
     const count = await RateLimitModel.countDocuments({
        IP: IP,
        URL: URL,
        date: { $gte: (new Date(Date.now() - interval)) },
     });
    

     if (count  >= maxRequests) {
        return res.sendStatus(429); 
     }
      await RateLimitModel.insertMany([{ IP: IP, URL: URL, date: date }]);
     next(); 
  } catch (err) {
     console.error(err);
     res.sendStatus(500); 
  }
}





