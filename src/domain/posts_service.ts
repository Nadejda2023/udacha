import { randomUUID } from "crypto"
import { PostViewDBModel, PostViewModel, PostsViewDBModelType } from "../models/postsModel"
import { PostsRepository } from "../repositories/posts_db__repository"
import { blogsRepository } from "../repositories/blogs_db__repository"

 
 export class PostService {
    postsRepository: PostsRepository
    constructor(){
        this.postsRepository= new PostsRepository()
    }

    async findAllPosts(): Promise<PostViewDBModel[]> { 
        return this.postsRepository.findAllPosts()
     }

    async findPostById(id: string): Promise<PostViewModel | null> {
        return this.postsRepository.findPostById(id)      
     }
 
    async createPost(title: string, shortDescription: string,
         content: string, blogId: string): Promise<PostViewDBModel | null> {
        const blog = await blogsRepository.findBlogById(blogId)
        if(!blog) return null 
        const newPost: PostsViewDBModelType = new PostsViewDBModelType(
            randomUUID(),
            title,
            shortDescription,
            content,
            blogId,
            blog.name,
            new Date().toISOString()
            )   // поменяла на класс PostsViewDBModelType
            
        
        const newPostWithId =  await this.postsRepository.createPost(newPost)
        return newPostWithId 
    }

    async updatePost(id: string,
         title: string, shortDescription: string,
          content: string, blogId: string) 
          : Promise<boolean | undefined> {
        let foundPost = await this.postsRepository.findPostById(id)
        let foundBlogName = await blogsRepository.findBlogById(blogId)
        return await this.postsRepository.updatePost(id, title, shortDescription, content, blogId)    
    }

    async deletePost(id: string): Promise<boolean> {
        return await this.postsRepository.deletePost(id)
    }

    async deleteAllPosts(): Promise<boolean> {
       return await this.postsRepository.deleteAllPosts()  
    }

 }
 export const postService = new PostService();
 