import { BlogModel, db } from "../db/db";
import {  BlogsViewDBModel, BlogsViewModel, PaginatedBlog, } from "../models/blogsModel";







export const blogsRepository = {
   async findAllBlogs(title: string | null | undefined): Promise<BlogsViewDBModel[]> { 

    const filter: any = {}

    if (title) {
        filter.title = {$regex: title}
    }
    return BlogModel.find((filter), {projection:{_id:0}}).lean()
     
    },

   async findBlogById(id: string): Promise<BlogsViewModel | null> {
        return BlogModel.findOne({id: id}, {projection:{_id:0}}) 

    },
    
    async createBlog(newBlog: BlogsViewModel): Promise<BlogsViewDBModel| null > {
        await BlogModel.insertMany([{...newBlog}])
        const newBlogId = await BlogModel.findOne({id:newBlog.id}, {projection:{_id:0}} )
        return newBlogId
    }, 


    async updateBlog(id: string, name: string, description: string, website: string): Promise< boolean | undefined> {
        
           
        const result = await BlogModel.updateOne({id: id},{ $set:{name, description, website}})
        return result.matchedCount === 1
        
    
    },

    async deleteBlog(id: string) {
        
         const result = BlogModel.deleteOne({id:id})

         return (await result).deletedCount === 1
        
    },

    async deleteAllBlogs(): Promise<boolean> {

        try { const result = await BlogModel.deleteMany({})
        
            return result.acknowledged
        }catch(e){
                return false
            }
        
    } 
} 