import { Router, Request, Response} from "express";
import { createPostValidationC } from "../middlewares/commentInputValidation";
import { authMiddleware } from "../middlewares/auth-middleware";
import { CommentDB, commentViewModel, commentViewType} from "../models/commentModels";
import { commentRepository } from "../repositories/commentRepository";
import { validationCommentLikeStatus } from "../middlewares/likemiddleware";
import { LikeStatus, LikeStatusType } from "../db/db";
import { userMiddleware } from "../middlewares/userMiddleware";



export const commentRouter = Router({})

class CommentController {
  async commentUpdateLikeStatus(req: Request, res: Response) {
    const commentId = req.params.commentId;
    const likeStat = req.body;
    const user = req.user 


    //const existingComment = null
      const existingComment: CommentDB | null = await commentRepository.findCommentById(commentId);

      if (!existingComment) {
        return res.sendStatus(404);
      }

    
    const isReactionExist = existingComment.likesInfo.statuses.find(((s: LikeStatusType) => s.userId === user!.id))

if(isReactionExist){
  if (likeStat.likeStatus === 'Like' && isReactionExist.myStatus === 'None'){
    isReactionExist.myStatus = LikeStatus.Like;
    existingComment.likesInfo.likesCount += 1;
  } else if (likeStat.likeStatus === 'Like' && isReactionExist.myStatus === 'Dislike'){
    isReactionExist.myStatus = LikeStatus.Like;
    existingComment.likesInfo.likesCount += 1;
    existingComment.likesInfo.dislikesCount -= 1;
  } else  if (likeStat.likeStatus === 'Dislike' && isReactionExist.myStatus === 'None'){
    isReactionExist.myStatus = LikeStatus.Dislike
    existingComment.likesInfo.dislikesCount += 1;
  } else if (likeStat.likeStatus === 'Dislike' && isReactionExist.myStatus === 'Like'){
    isReactionExist.myStatus = LikeStatus.Dislike;
    existingComment.likesInfo.likesCount -= 1;
    existingComment.likesInfo.dislikesCount += 1;
  } else if(likeStat.likeStatus === 'None' && isReactionExist.myStatus === 'Dislike') {
    isReactionExist.myStatus = LikeStatus.None
    existingComment.likesInfo.dislikesCount -= 1;
  } else if(likeStat.likeStatus === 'None' && isReactionExist.myStatus === 'Like') {
    isReactionExist.myStatus = LikeStatus.None
    existingComment.likesInfo.likesCount -= 1;
  } 
}else {
  if (likeStat.likeStatus === 'Like') {
        existingComment.likesInfo.likesCount += 1;
        existingComment.likesInfo.statuses.push({
          myStatus:LikeStatus.Like,
          userId: user!.id,
          createdAt: new Date().toISOString()
        })
      } else if (likeStat.likeStatus === 'Dislike'){
        existingComment.likesInfo.dislikesCount += 1;
        existingComment.likesInfo.statuses.push({
          myStatus:LikeStatus.Dislike,
          userId: user!.id,
          createdAt: new Date().toISOString()
        })

      } else if (likeStat.likeStatus === 'None'){
        existingComment.likesInfo.statuses.push({
          myStatus:LikeStatus.None,
          userId: user!.id,
          createdAt: new Date().toISOString()
        })
      }
      
        await commentRepository.updateCommentLikeStatus(existingComment);

        return res.sendStatus(204);
    }

    
  }
  

    
  

  async updateCommentById(req: Request , res: Response) {
    
    const user = req.user!
    const commentId = req.params.commentId

    const existingComment = await commentRepository.findCommentById(commentId);
    if (!existingComment) {
        return res.sendStatus(404); 
    }

    if (existingComment.commentatorInfo.userId !== user.id) {
      return res.sendStatus(403); 
    }
    
    const updateComment = await commentRepository.updateComment(commentId, req.body.content);

    if (updateComment) {
      return res.sendStatus(204); 
    } 
  }  


  async getCommentById(req: Request, res: Response<commentViewType| undefined >) {
    const user = req.user!
    console.log('user:', user)
    const foundComment: CommentDB | null = await commentRepository.findCommentById(req.params.commentId)
    console.log('foundComment:', foundComment)    
      if (foundComment) {
        return res.status(200).send(CommentDB.getViewModel(user, foundComment)) 
      } else {
        return res.sendStatus(404)
    }
    }

    async deleteCommentById(req: Request, res: Response) {
      const user = req.user!
      const commentId = req.params.commentId
      const comment = await commentRepository.findCommentById(commentId)
      
      if (!comment) {
        return res.sendStatus(404)
      } else {
      const commentUserId = comment.commentatorInfo.userId
      if (commentUserId !== user.id) {
          return res.sendStatus(403)
      }
      const commentDelete = await commentRepository.deleteComment(req.params.commentId);
      if(commentDelete){
          return res.sendStatus(204)
        }
  
  }
}
}
 


const commentControllerInstance = new CommentController()

commentRouter.put('/:commentId/like-status',
authMiddleware,
validationCommentLikeStatus,
 commentControllerInstance.commentUpdateLikeStatus.bind(commentControllerInstance)
 )

  commentRouter.put('/:commentId',
  authMiddleware,
  createPostValidationC, commentControllerInstance.updateCommentById.bind(commentControllerInstance)
  )

  commentRouter.get('/:commentId',userMiddleware, commentControllerInstance.getCommentById.bind(commentControllerInstance)
  ) 

  commentRouter.delete('/:commentId', 
  authMiddleware, commentControllerInstance.deleteCommentById.bind(commentControllerInstance)
  ) 

