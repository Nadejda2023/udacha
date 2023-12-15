import {  WithId } from "mongodb"
import { BlogsViewModel, PaginatedBlog } from "../models/blogsModel"
import { PaginatedPost, PostViewModel, PostViewModel2, PostsDBModels } from "../models/postsModel"
import { randomUUID } from "crypto"
import { blogsRepository } from "./blogs_db__repository"
import { TPagination } from "../hellpers/pagination"
import { BlogModel, PostModel } from "../db/db"
import { UsersModel } from "../models/usersModel"
import { CommentDB } from "../models/commentModels"


export class QueryRepo {
    async findBlogs(pagination: TPagination):
    Promise<PaginatedBlog<BlogsViewModel>> {
       const filter = {name: { $regex :pagination.searchNameTerm, $options: 'i'}}
       const result : WithId<WithId<BlogsViewModel>>[] = await BlogModel.find
       (filter, {projection: {_id: 0}})
   
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
   }

   async findPostForBlog(blogId: string,pagination: TPagination):
    Promise<PaginatedPost<PostViewModel2>> {
       const result: WithId<WithId<PostViewModel2>>[] = await PostModel.find
       ({blogId}, {projection: {_id: 0}})
   .sort({[pagination.sortBy]: pagination.sortDirection})
   .skip(pagination.skip)
   .limit(pagination.pageSize)
   .lean() 

       const totalCount: number = await PostModel.countDocuments({blogId})
       const pageCount: number = Math.ceil(totalCount / pagination.pageSize)

   const response: PaginatedPost<PostViewModel2> = {
       pagesCount: pageCount,
       page: pagination.pageNumber,
       pageSize: pagination.pageSize,
       totalCount: totalCount,
       items: result
       }
       return  response

   }
   
async createPostForBlog(title: string, shortDescription: string, content: string,  blogId: string, user: UsersModel | null):
Promise <PostViewModel2 | null> {
   
   const  blog = await blogsRepository.findBlogById(blogId)
   if(!blog) return null
   const createPostForBlog: PostViewModel2= {
       id: randomUUID(),
       title: title,
       shortDescription: shortDescription,
       content: content,
       blogId: blog.id,
       blogName: blog.name,
       createdAt: new Date().toISOString(),
       extendedLikesInfo:{
        likesCount: 0,
        dislikesCount: 0,
        myStatus: 'None',
        newestLikes: user ?[{
          addedAt: new Date().toISOString(),
          userId: user.id,
          login: user.login
        }] : []
    
        },
       }

    const result = await PostModel.create(createPostForBlog)
   return {
    id: createPostForBlog.id,
    title: createPostForBlog.title,
    shortDescription: createPostForBlog.shortDescription,
    content: createPostForBlog.content,
    blogId: createPostForBlog.blogId,
    blogName: createPostForBlog.blogName,
    createdAt: createPostForBlog.createdAt,
    extendedLikesInfo: {
    likesCount: createPostForBlog.extendedLikesInfo.likesCount,
    dislikesCount: createPostForBlog.extendedLikesInfo.dislikesCount,
    myStatus: createPostForBlog.extendedLikesInfo.myStatus,
    newestLikes: user ? [{
        addedAt: createPostForBlog.extendedLikesInfo.newestLikes[0]?.addedAt || '',
        userId: createPostForBlog.extendedLikesInfo.newestLikes[0]?.userId || '',
        login: createPostForBlog.extendedLikesInfo.newestLikes[0]?.login || ''
    }] : []

  },

}
}

   async findAllPosts(pagination: TPagination, user: UsersModel | null):
    Promise<PaginatedPost<PostViewModel2>> {
       const result : WithId<WithId<PostsDBModels>>[] = await PostModel.find
       ({}, {projection: {_id: 0}})
   .sort({[pagination.sortBy]: pagination.sortDirection })
   .skip(pagination.skip)
   .limit(pagination.pageSize)
   .lean()

       const totalCount: number = await PostModel.countDocuments({})
       const pageCount: number = Math.ceil(totalCount / pagination.pageSize)

   const response: PaginatedPost<PostViewModel2> = {
       pagesCount: pageCount,
       page: pagination.pageNumber,
       pageSize: pagination.pageSize,
       totalCount: totalCount,
       items: result.map(item => PostsDBModels.getViewModel(user,item))
       }
       return response
   }

}

export const queryRepo = new QueryRepo