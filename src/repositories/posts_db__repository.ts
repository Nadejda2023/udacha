import { PostModel, db} from "../db/db"
import { PostViewDBModel, PostViewModel } from "../models/postsModel"

 
 export class PostsRepository{
    async findAllPosts(): Promise<PostViewDBModel[]> { 

        const filter: any = {}
    
        return PostModel.find((filter), {projection:{_id:0}}).lean()
         
        }
        async findPostById(id: string): Promise<PostViewDBModel | null> {
            return PostModel.findOne({id: id}, {projection: {_id: 0}}) //proj : postId
            
        
            
        }
 
    async createPost(newPost:PostViewModel): Promise<PostViewDBModel | null> {
        const result = await PostModel.insertMany([{...newPost}])
        const newPostWithId =  await PostModel.findOne({id:newPost.id}, {projection:{_id:0}} )
        return newPostWithId 
    }
    async updatePost(
        id: string, title: string, shortDescription: string, content: string, blogId: string)
         : Promise<boolean | undefined> {
        let foundPost = await PostModel.findOne({id:id})
        let foundBlogName = await PostModel.findOne({id: blogId}, {projection: {_id:0}})
        if(foundPost){
            if(foundBlogName) {
                const result = await PostModel.updateOne({ id : id }, { $set: {title: title, shortDescription: shortDescription, content: content, blogId: blogId} })
                return result.matchedCount === 1

            }
        }
        
    
    }
    async deletePost(id: string): Promise<boolean> {
        const result = await PostModel.deleteOne({id: id})
        return result.deletedCount === 1
   
    }
    async deleteAllPosts(): Promise<boolean> {
        const result = await PostModel.deleteMany({})
      
        return result.acknowledged  === true
    
        
    }

 }
 export const postsRepository = new PostsRepository







