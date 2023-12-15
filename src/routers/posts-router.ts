import {Request, Response, Router } from "express";
import { sendStatus } from "./sendStatus";
import { authorizationValidation} from "../middlewares/inputvalidationmiddleware";
import { createPostValidation} from "../middlewares/postsvalidation";
import { updatePostValidation } from "../middlewares/postsvalidation";
import { PaginatedPost, PostViewModel2,  PostViewModel, PostsDBModels } from "../models/postsModel";
import { blogsRepository } from "../repositories/blogs_db__repository";
import { getPaginationFromQuery } from "../hellpers/pagination";
import { postsRepository } from "../repositories/posts_db__repository";
import { CommentDB, PaginatedCommentViewModel, commentViewType } from "../models/commentModels";
import { commentRepository } from "../repositories/commentRepository";
import { authMiddleware } from "../middlewares/auth-middleware";
import { createPostValidationC } from "../middlewares/commentInputValidation";
import { PostService } from "../domain/posts_service";
import { queryRepo } from "../repositories/queryRepo";
import { postsQueryRepository } from "../repositories/postsQueryRepository";
import { userMiddleware } from "../middlewares/userMiddleware";
import { validationCommentLikeStatus } from "../middlewares/likemiddleware";
import { LikeStatus, LikeStatusTypePost, NewestLikeTypePost } from "../db/db";

export const postsRouter = Router({})

 class PostsController{
  
  private postsService: PostService
  constructor() {
    this.postsService = new PostService()
  }

  async updatePostWithLikeStatus(req: Request, res: Response){
    const postId = req.params.postId;
    const likeStat = req.body;
    const user = req.user 

    const existingPost: PostsDBModels | null = await postsRepository.findPostById(postId)
     console.log('existingPost:', existingPost)
      if (!existingPost) {
        return res.sendStatus(404);
      }

      const isReactionExist = existingPost.extendedLikesInfo.statuses.find(((s: LikeStatusTypePost) => s.userId === user!.id))
      console.log('isReactionExist:', isReactionExist)

      if(isReactionExist){
        if (likeStat.likeStatus === 'Like' && isReactionExist.myStatus === 'None'){
          isReactionExist.myStatus = LikeStatus.Like;
          existingPost.extendedLikesInfo.likesCount += 1;
        } else if (likeStat.likeStatus === 'Like' && isReactionExist.myStatus === 'Dislike'){
          isReactionExist.myStatus = LikeStatus.Like;
          existingPost.extendedLikesInfo.likesCount += 1;
          existingPost.extendedLikesInfo.dislikesCount -= 1;
        } else  if (likeStat.likeStatus === 'Dislike' && isReactionExist.myStatus === 'None'){
          isReactionExist.myStatus = LikeStatus.Dislike
          existingPost.extendedLikesInfo.dislikesCount += 1;
        } else if (likeStat.likeStatus === 'Dislike' && isReactionExist.myStatus === 'Like'){
          isReactionExist.myStatus = LikeStatus.Dislike;
          existingPost.extendedLikesInfo.likesCount -= 1;
          existingPost.extendedLikesInfo.dislikesCount += 1;
        } else if(likeStat.likeStatus === 'None' && isReactionExist.myStatus === 'Dislike') {
          isReactionExist.myStatus = LikeStatus.None
          existingPost.extendedLikesInfo.dislikesCount -= 1;
        } else if(likeStat.likeStatus === 'None' && isReactionExist.myStatus === 'Like') {
          isReactionExist.myStatus = LikeStatus.None
          existingPost.extendedLikesInfo.likesCount -= 1;
        } 
      }else {
        if (likeStat.likeStatus === 'Like') {
          existingPost.extendedLikesInfo.likesCount += 1;
          existingPost.extendedLikesInfo.statuses.push({
                myStatus:LikeStatus.Like,
                userId: user!.id,
                createdAt: new Date().toISOString()
              })
            } else if (likeStat.likeStatus === 'Dislike'){
              existingPost.extendedLikesInfo.dislikesCount += 1;
              existingPost.extendedLikesInfo.statuses.push({
                myStatus:LikeStatus.Dislike,
                userId: user!.id,
                createdAt: new Date().toISOString()
              })
      
            } else if (likeStat.likeStatus === 'None'){
              existingPost.extendedLikesInfo.statuses.push({
                myStatus:LikeStatus.None,
                userId: user!.id,
                createdAt: new Date().toISOString()
              })
            }
          }
      
       
          const latestLikes = existingPost.extendedLikesInfo.statuses
              .filter((like: LikeStatusTypePost) => like.myStatus !== LikeStatus.None)
              .sort((a: LikeStatusTypePost, b: LikeStatusTypePost) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .slice(0, 3);

              await postsQueryRepository.updatePostLikeStatus(existingPost, latestLikes);

              

            //   const response: PostViewModel2 = {
            //     id: existingPost.id,
            // title: existingPost.title,
            // shortDescription: existingPost.shortDescription,
            // content: existingPost.content,
            // blogId: existingPost.blogId,
            // blogName: existingPost.blogName,
            // createdAt: existingPost.createdAt,
            //     extendedLikesInfo: {
            //       likesCount: existingPost.extendedLikesInfo.likesCount,
            //       dislikesCount: existingPost.extendedLikesInfo.dislikesCount,
            //       myStatus: existingPost.extendedLikesInfo.myStatus,
            //       newestLikes: latestLikes.map((like: LikeStatusTypePost) => ({
            //         addedAt: like.createdAt,
            //         userId: like.userId,
            //         login: user!.login, 
            //       })),
            //     }
            //   }
                


          return res.sendStatus(204) //.send(response)
  }

  async getCommentFromPost(req: Request, res: Response){   
    const foundedPostId = await postsRepository.findPostById(req.params.postId)
    if(!foundedPostId) {
    return res.sendStatus(404)
    
  }
  const pagination = getPaginationFromQuery(req.query)
  const user = req.user
  const allCommentsForPostId: PaginatedCommentViewModel<commentViewType> =
  await commentRepository.getAllCommentsForPost(req.params.postId, pagination, user) 
     return res.status(200).send(allCommentsForPostId)
      
 }

 async createCommentsPost(req: Request, res: Response) { 
    const postWithId: PostsDBModels| null = await postsRepository.findPostById(req.params.postId);
    
    if(!postWithId) {
      return res.sendStatus(404)
    
    }
  
  const comment: commentViewType | null = await postsQueryRepository
  .createPostComment(postWithId.id, req.body.content, {userId: req.user!.id, userLogin: req.user!.login})
  
      return res.status(201).send(comment)

  }

 async getPostWithPagination(req: Request, res: Response<PaginatedPost<PostViewModel2>>) {
  const pagination = getPaginationFromQuery(req.query)
  const user = req.user
  const foundPost: PaginatedPost<PostViewModel2> = await queryRepo.findAllPosts(pagination, user)
  if(!foundPost){
    return res.sendStatus(sendStatus.NOT_FOUND_404)
  } else {
    return res.status(sendStatus.OK_200).send(foundPost)
  }
  
  }

  async getPostById(req: Request, res: Response<PostViewModel2| undefined | null>) {
    const user = req.user!
    const foundPost: PostsDBModels | null = await this.postsService.findPostById(req.params.id)    
      if (foundPost) {
       
        return res.status(sendStatus.OK_200).send(PostsDBModels.getViewModel(user, foundPost))
        
      } else {
        
        return res.sendStatus(sendStatus.NOT_FOUND_404)
    }
    }

    async createPost(req: Request, res: Response<PostViewModel2 | undefined | null>) {
      const findBlogById =  await blogsRepository.findBlogById(req.body.blogId)
      const user = req.user 
      
      if (findBlogById) {
        const { title ,shortDescription, content, blogId} = req.body
      const newPost : PostViewModel2 | null= await this.postsService.createPost(title,shortDescription, content, blogId, user)
        if(!newPost) {
          
          return res.sendStatus(sendStatus.BAD_REQUEST_400 )
      } else {
        
        return res.status(sendStatus.CREATED_201).send(newPost)
      }
    }
    
    } 

    async updatePost(req: Request , res: Response<boolean | undefined>) {
      const id = req.params.id
      const { title, shortDescription, content, blogId} = req.body
      const updatePost = await this.postsService.updatePost(id, title, shortDescription, content, blogId)
  
    
      if (!updatePost) {
        return res.sendStatus(sendStatus.NOT_FOUND_404)
      } else {
        return res.sendStatus(sendStatus.NO_CONTENT_204)
      }
  }

  async deletePostById(req: Request, res: Response) {
    const foundPost = await this.postsService.deletePost(req.params.id)
    if (!foundPost) {
      return res.sendStatus(sendStatus.NOT_FOUND_404);
      } 
     res.sendStatus(sendStatus.NO_CONTENT_204)
    }



}

const postsControllerInstance = new PostsController()

postsRouter.put('/:postId/like-status', 
authMiddleware,
validationCommentLikeStatus,
//updatePostValidation,
postsControllerInstance.updatePostWithLikeStatus.bind(postsControllerInstance))
postsRouter.get('/:postId/comments', userMiddleware, postsControllerInstance.getCommentFromPost.bind(postsControllerInstance))
postsRouter.post('/:postId/comments',
 authMiddleware, 
 createPostValidationC,
 postsControllerInstance.createCommentsPost.bind(postsControllerInstance) )

postsRouter.get('/', postsControllerInstance.getPostWithPagination.bind(postsControllerInstance) )

postsRouter.get('/:id', postsControllerInstance.getPostById.bind(postsControllerInstance) )
  
postsRouter.post('/', 
  authorizationValidation,
  createPostValidation,
  postsControllerInstance.createPost.bind(postsControllerInstance)
 )
  

postsRouter.put('/:id', 
authorizationValidation,
updatePostValidation,
postsControllerInstance.updatePost.bind(postsControllerInstance))
  
postsRouter.delete('/:id', 
authorizationValidation,
postsControllerInstance.deletePostById.bind(postsControllerInstance)
)
