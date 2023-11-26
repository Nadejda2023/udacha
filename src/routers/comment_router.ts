import { Router, Request, Response} from "express";
import { createPostValidationC } from "../middlewares/commentInputValidation";
import { authMiddleware } from "../middlewares/auth-middleware";
import { commentDBViewModel } from "../models/commentModels";
import { commentQueryRepository } from "../repositories/commentQueryRepository";
import { authQueryRepository } from "../repositories/authQueryRepositorii";


export const commentRouter = Router({})

class CommentController {
  async commentUpdateLikeStatus(req: Request, res: Response) {
    const commentId = req.params.commentId;
    const likeStat = req.body;
    const accessToken = req.headers.authorization;

    try {
      const existingComment: commentDBViewModel | null = await commentQueryRepository.findCommentById(commentId);

      if (!existingComment) {
        return res.sendStatus(404);
      }

      const isValidAccessToken = await authQueryRepository.validateAccessToken(accessToken!);
      const userId = isValidAccessToken.userId;

      if (!likeStat || !['Like', 'Dislike', 'Reset'].includes(likeStat.likeStatus)) {
        return res.status(400).json({
          errorsMessages: [{ message: 'Invalid like status', field: 'likeStatus' }],
        });
      }

      if (likeStat.likeStatus === 'Like') {
        existingComment.likesInfo.likesCount += 1;
        existingComment.likesInfo.myStatus = 'Like';
      } else if (likeStat.likeStatus === 'Dislike') {
        existingComment.likesInfo.dislikesCount += 1;
        existingComment.likesInfo.myStatus = 'Dislike';
      } else if (likeStat.likeStatus === 'Reset') {
        if (existingComment.likesInfo.myStatus === 'Like') {
          existingComment.likesInfo.likesCount -= 1;
        } else if (existingComment.likesInfo.myStatus === 'Dislike') {
          existingComment.likesInfo.dislikesCount -= 1;
        }

        existingComment.likesInfo.myStatus = 'None';
        await commentQueryRepository.updateComment(existingComment.id, existingComment.content);

        return res.status(204).send();
      }
    } catch (error) {
      console.error(error);
      return res.status(500).send('Internal Server Error');
    }
  }

  async updateCommentById(req: Request , res: Response) {
    
    const user = req.user!
    const commentId = req.params.commentId

    const existingComment = await commentQueryRepository.findCommentById(commentId);
    if (!existingComment) {
        return res.sendStatus(404); 
    }

    if (existingComment.commentatorInfo.userId !== user.id) {
      return res.sendStatus(403); 
    }
    
    const updateComment = await commentQueryRepository.updateComment(commentId, req.body.content);

    if (updateComment) {
      return res.sendStatus(204); 
    } 
  }  

  async getCommentById(req: Request, res: Response<commentDBViewModel| undefined >) {
    const foundComment = await commentQueryRepository.findCommentById(req.params.commentId)    
      if (foundComment) {
        return res.status(200).send(foundComment) 
      } else {
        return res.sendStatus(404)
    }
    }

    async deleteCommentById(req: Request, res: Response) {
      const user = req.user!
      const commentId = req.params.commentId
      const comment = await commentQueryRepository.findCommentById(commentId)
    console.log('user :', user)
      if (!comment) {
        return res.sendStatus(404)
      } else {
      const commentUserId = comment.commentatorInfo.userId
      if (commentUserId !== user.id) {
          return res.sendStatus(403)
      }
      const commentDelete = await commentQueryRepository.deleteComment(req.params.commentId);
      if(commentDelete){
          return res.sendStatus(204)
        }
  
  }
}
 
}

const commentControllerInstance = new CommentController
commentRouter.put('/:commentId/like-status',
authMiddleware,
 commentControllerInstance.commentUpdateLikeStatus.bind(commentControllerInstance))

  commentRouter.put('/:commentId',
  authMiddleware,
  createPostValidationC, commentControllerInstance.updateCommentById.bind(commentControllerInstance))

  commentRouter.get('/:commentId', commentControllerInstance.getCommentById.bind(commentControllerInstance))

  commentRouter.delete('/:commentId', 
  authMiddleware, commentControllerInstance.deleteCommentById.bind(commentControllerInstance)
  ) 

