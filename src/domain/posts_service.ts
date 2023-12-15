import { randomUUID } from "crypto"
import { PostViewModel2, PostViewModel, PostsDBModels} from "../models/postsModel"
import { PostsRepository } from "../repositories/posts_db__repository"
import { blogsRepository } from "../repositories/blogs_db__repository"
import { UsersModel } from "../models/usersModel"

 
 export class PostService {
    postsRepository: PostsRepository
    constructor(){
        this.postsRepository= new PostsRepository()
    }

    async findAllPosts(): Promise<PostViewModel2[]> { 
        return this.postsRepository.findAllPosts()
     }

    async findPostById(id: string): Promise<PostsDBModels | null> {
        return this.postsRepository.findPostById(id)      
     }
 
    async createPost(title: string, shortDescription: string,
         content: string, blogId: string, user : UsersModel | null): Promise<PostViewModel2 | null> {
            
           
        const blog = await blogsRepository.findBlogById(blogId)
        if(!blog) return null 
        const newPost: PostViewModel2  = {
            id: randomUUID(),
            title,
            shortDescription,
            content,
            blogId,
            blogName: blog.name,
            createdAt: new Date().toISOString(),
            extendedLikesInfo:{
                likesCount: 0,
                dislikesCount: 0,
                myStatus: 'None',
                newestLikes: user ? [{
                  addedAt: new Date().toISOString(),
                  userId: user.id,
                  login: user.login
                }] : []
            
                },
            }
            
        const newPostWithId =  await this.postsRepository.createPost(newPost, user)
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
 