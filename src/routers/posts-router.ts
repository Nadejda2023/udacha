import {Request, Response, Router } from "express";
import { sendStatus } from "./sendStatus";
import { authorizationValidation} from "../middlewares/inputvalidationmiddleware";
import { createPostValidation} from "../middlewares/postsvalidation";
import { updatePostValidation } from "../middlewares/postsvalidation";
import { PaginatedPost, PostViewDBModel,  PostViewModel } from "../models/postsModel";
import { blogsRepository } from "../repositories/blogs_db__repository";
import { getPaginationFromQuery } from "../hellpers/pagination";
import { postsRepository } from "../repositories/posts_db__repository";
import { CommentDB, PaginatedCommentViewModel, commentViewModel, commentViewType } from "../models/commentModels";
import { commentRepository } from "../repositories/commentRepository";
import { authMiddleware } from "../middlewares/auth-middleware";
import { createPostValidationC } from "../middlewares/commentInputValidation";
import { PostService } from "../domain/posts_service";
import { queryRepo } from "../repositories/queryRepo";
import { postsQueryRepository } from "../repositories/postsQueryRepository";
import { userMiddleware } from "../middlewares/userMiddleware";

export const postsRouter = Router({})

 class PostsController{
  
  private postsService: PostService
  constructor() {
    this.postsService = new PostService
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
    const postWithId: PostViewDBModel| null = await postsRepository.findPostById(req.params.postId);
    
    if(!postWithId) {
      return res.sendStatus(404)
    
    }
  
  const comment: commentViewType | null = await postsQueryRepository
  .createPostComment(postWithId.id, req.body.content, {userId: req.user!.id, userLogin: req.user!.login})
  
      return res.status(201).send(comment)

  }

 async getPostWithPagination(req: Request, res: Response<PaginatedPost<PostViewModel>>) {
  const pagination = getPaginationFromQuery(req.query)
  const foundPost: PaginatedPost<PostViewModel> = await queryRepo.findAllPosts(pagination)
  if(!foundPost){
    return res.sendStatus(sendStatus.NOT_FOUND_404)
  } else {
    return res.status(sendStatus.OK_200).send(foundPost)
  }
  
  }

  async getPostById(req: Request, res: Response<PostViewModel| undefined | null>) {
  
    const foundPost = await this.postsService.findPostById(req.params.id)    
      if (foundPost) {
        return res.status(sendStatus.OK_200).send(foundPost)
        
      } else {
        
        return res.sendStatus(sendStatus.NOT_FOUND_404)
    }
    }

    async createPost(req: Request, res: Response<PostViewDBModel| undefined | null>) {
      const findBlogById =  await blogsRepository.findBlogById(req.body.blogId)
      
      if (findBlogById) {
        const { title ,shortDescription, content, blogId} = req.body
      const newPost : PostViewDBModel | null= await this.postsService.createPost(title,shortDescription, content, blogId)
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

postsRouter.get('/:postId/comments', userMiddleware, postsControllerInstance.getCommentFromPost.bind(postsControllerInstance))
//middleware user req.user === user
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
