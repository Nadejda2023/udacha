import {  WithId } from "mongodb"
import { BlogsViewModel, PaginatedBlog } from "../models/blogsModel"
import { PaginatedPost, PostViewModel } from "../models/postsModel"
import { randomUUID } from "crypto"
import { blogsRepository } from "./blogs_db__repository"
import { TPagination } from "../hellpers/pagination"
import { BlogModel, PostModel } from "../db/db"



export const blogsQueryRepository = {
    //1
    async findBlogs(pagination: TPagination):
     Promise<PaginatedBlog<BlogsViewModel>> {
        const filter = {name: { $regex :pagination.searchNameTerm, $options: 'i'}}
        const result : WithId<WithId<BlogsViewModel>>[] = await BlogModel.find(filter, {projection: {_id: 0}})
    
    .sort({[pagination.sortBy]: pagination.sortDirection})
    .skip(pagination.skip)
    .limit(pagination.pageSize)
    .lean()
        const totalCount: number = await BlogModel.countDocuments(filter)
        const pageCount: number = Math.ceil(totalCount / pagination.pageSize)


    return {
        pagesCount: pageCount,
        page: pagination.pageNumber,
        pageSize: pagination.pageSize,
        totalCount: totalCount,
        items: result
        }
    },



    async findPostForBlog(blogId: string,pagination: TPagination):
     Promise<PaginatedPost<PostViewModel>> {
        const result: WithId<WithId<PostViewModel>>[] = await PostModel.find({blogId}, {projection: {_id: 0}})
    .sort({[pagination.sortBy]: pagination.sortDirection})
    .skip(pagination.skip)
    .limit(pagination.pageSize)
    .lean() 

        
        const totalCount: number = await PostModel.countDocuments({blogId})
        const pageCount: number = Math.ceil(totalCount / pagination.pageSize)


    const response: PaginatedPost<PostViewModel> = {
        pagesCount: pageCount,
        page: pagination.pageNumber,
        pageSize: pagination.pageSize,
        totalCount: totalCount,
        items: result
        }
        



        return  response

    },
    


async createPostForBlog(title: string, shortDescription: string, content: string,  blogId: string):
 Promise <PostViewModel | null> {
    
    const  blog = await blogsRepository.findBlogById(blogId)
    if(!blog) return null
    const createPostForBlog: PostViewModel= {
        id: randomUUID(),
        title: title,
        shortDescription: shortDescription,
        content: content,
        blogId: blog.id,
        blogName: blog.name,
        createdAt: new Date().toISOString()
        }

     await PostModel.insertMany([{...createPostForBlog}])
    return createPostForBlog


},



    //1
    async findAllPosts(pagination: TPagination):
     Promise<PaginatedPost<PostViewModel>> {
        const result : WithId<WithId<PostViewModel>>[] = await PostModel.find({}, {projection: {_id: 0}})
    .sort({[pagination.sortBy]: pagination.sortDirection })
    .skip(pagination.skip)
    .limit(pagination.pageSize)
    .lean()


    

        const totalCount: number = await PostModel.countDocuments({})
        const pageCount: number = Math.ceil(totalCount / pagination.pageSize)


    const response: PaginatedPost<PostViewModel> = {
        pagesCount: pageCount,
        page: pagination.pageNumber,
        pageSize: pagination.pageSize,
        totalCount: totalCount,
        items: result
        }
        return response
    }
    





}
