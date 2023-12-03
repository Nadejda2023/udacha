import {Request, Response, Router } from "express";
import { CreateBlogValidation , UpdateBlogValidation } from "../middlewares/blogsvalidation";
import { BlogsViewDBModel, BlogsViewModel, PaginatedBlog } from "../models/blogsModel";
import { sendStatus } from "./sendStatus";
import { authorizationValidation, inputValidationErrors } from "../middlewares/inputvalidationmiddleware";
import { PaginatedPost, PostViewModel } from "../models/postsModel";
import {  createPostValidationForBlogRouter } from "../middlewares/postsvalidation";
import { getPaginationFromQuery, getSearchNameTermFromQuery} from "../hellpers/pagination";
import { BlogService } from "../domain/blogs_service";
import { blogsRepository } from "../repositories/blogs_db__repository";
import { queryRepo } from "../repositories/queryRepo";



export const blogsRouter = Router({})

class BlogsController{
  private blogsService: BlogService
  constructor() {
    this.blogsService = new BlogService
  }

  async getBlogs(req: Request, res: Response) : Promise<void> {
    const pagination = getPaginationFromQuery(req.query)
    const name = getSearchNameTermFromQuery(req.query.searchNameTerm as string)
      const foundBlogs:PaginatedBlog<BlogsViewModel> = await queryRepo.findBlogs({...pagination, ...name})
      
      res.status(sendStatus.OK_200).send(foundBlogs)
    }

  async createBlog(req: Request , res: Response<BlogsViewDBModel | null >) {
    const { name, description, websiteUrl} = req.body
  const newBlog : BlogsViewDBModel| null  = await this.blogsService.createBlog(name, description, websiteUrl)
  
  return res.status(sendStatus.CREATED_201).send(newBlog)
  
    }

  async getPostByBlogId(req: Request, res: Response) { 
  
    const blogPost:BlogsViewModel | null = await blogsRepository.findBlogById(req.params.blogId)
  if(!blogPost) {
    return res.sendStatus(404)
    
   }
   
   const pagination = getPaginationFromQuery(req.query)
   
    const BlogsFindPosts: PaginatedPost<PostViewModel> = 
    await queryRepo.findPostForBlog(req.params.blogId, pagination)
    
      return res.status(200).send(BlogsFindPosts)
      
     
  }

  async createPostForBlog(req: Request, res: Response) { 
    const blogWithId: BlogsViewModel| null = await blogsRepository.findBlogById(req.params.blogId) 
    if(!blogWithId) {
      return res.sendStatus(404)
     
    }
    
      const blogsCreatePost: PostViewModel | null = await queryRepo.createPostForBlog(req.body.title, req.body.shortDescription, req.body.content, req.params.blogId)
      if(blogsCreatePost) {
        return res.status(201).send(blogsCreatePost)
        
       }
    }

    async getBlogById(req: Request, res: Response<BlogsViewModel| null>) {
      const foundBlog: BlogsViewModel | null = await this.blogsService.findBlogById(req.params.id)
      if (foundBlog) {
        return res.status(sendStatus.OK_200).send(foundBlog)
      } else {
        return res.sendStatus(sendStatus.NOT_FOUND_404)
      }
  }

  async updateBlog(req: Request , res: Response <boolean | undefined>) {
    const id = req.params.id
    const { name, description, websiteUrl} = req.body

    const updateBlog = await this.blogsService.updateBlog(id, name, description, websiteUrl)
    if (updateBlog) {
      return res.sendStatus(sendStatus.NO_CONTENT_204)
      
    } else {
      return res.sendStatus(sendStatus.NOT_FOUND_404)
    }
}

  async deleteBlogById(req: Request, res: Response) {
    const foundBlog = await this.blogsService.deleteBlog(req.params.id);
    if (!foundBlog) {
      return  res.sendStatus(sendStatus.NOT_FOUND_404)
    } else {
    return res.sendStatus(sendStatus.NO_CONTENT_204)
    }
  } 
}

const blogsControllerInstance = new BlogsController()

blogsRouter.get('/', blogsControllerInstance.getBlogs.bind(blogsControllerInstance))
  

blogsRouter.post('/',
  authorizationValidation,
  ...CreateBlogValidation,
  blogsControllerInstance.createBlog.bind(blogsControllerInstance))
  

blogsRouter.get('/:blogId/posts', blogsControllerInstance.getPostByBlogId.bind(blogsControllerInstance))

//3
blogsRouter.post('/:blogId/posts',
authorizationValidation, 
createPostValidationForBlogRouter,
blogsControllerInstance.createPostForBlog)

  blogsRouter.get('/:id', blogsControllerInstance.getBlogById.bind(blogsControllerInstance))
  
blogsRouter.put('/:id',
  authorizationValidation,
  ...UpdateBlogValidation,
  blogsControllerInstance.updateBlog.bind(blogsControllerInstance))
  
blogsRouter.delete('/:id', 
  authorizationValidation,
  blogsControllerInstance.deleteBlogById.bind(blogsControllerInstance)) 