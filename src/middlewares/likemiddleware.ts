import {Response, Request, NextFunction } from "express";

export function validationCommentLikeStatus(req: Request, res: Response, next: NextFunction) {
    const likeStat = req.body;
  
    if (!['Like', 'Dislike', 'None'].includes(likeStat.likeStatus)) {
      return res.status(400).json({
        errorsMessages: [{ message: 'Invalid like status', field: 'likeStatus' }],
      });
    }
  
    
    next();
  }