import {WithId } from "mongodb"
import { LikeStatus, LikeStatusTypePost, NewestLikeTypePost } from "../db/db"
import { UsersModel } from "./usersModel"

export type PostViewInputModel = {
    id: string,
    title: string,
    shortDescription: string,
    content: string,
    blogId: string,
  }

export type PostViewModel = {
    id: string,
    title: string,
    shortDescription: string,
    content: string,
    blogId: string,
    blogName: string,
    createdAt: string,
  }
  export class PostsDBModels {
    constructor(
     public id: string,
     public title: string,
     public shortDescription: string,
     public content: string,
     public blogId: string,
     public blogName: string,
     public createdAt: string,
     public extendedLikesInfo: {
      likesCount: number,
      dislikesCount: number,
      myStatus: string,// в бд не надо его 
      statuses: LikeStatusTypePost[],
      newestLikes: NewestLikeTypePost[]
        
      
    }
     ) { }
     static getViewModel(user: UsersModel | null, post: PostsDBModels ):PostViewModel2{
      return { 
        id: post.id,
        title:post.title,
        shortDescription: post.shortDescription,
        content: post.content,
        blogId: post.blogId,
        blogName: post.blogName,
        createdAt: post.createdAt,
        extendedLikesInfo: {
          likesCount: post.extendedLikesInfo.likesCount, 
          dislikesCount:  post.extendedLikesInfo.dislikesCount,
          myStatus: user ? 
          post.extendedLikesInfo.statuses.find(((s: LikeStatusTypePost) => s.userId === user!.id))?.myStatus || LikeStatus.None
        : LikeStatus.None,
        newestLikes: post.extendedLikesInfo.newestLikes
        },
        

        
      }
    }
    }   
  export type PostViewModel2 = { 
    id: string,
    title: string,
    shortDescription: string,
    content: string,
    blogId: string,
    blogName: string,
    createdAt: string,
    extendedLikesInfo: {
      likesCount: number,
      dislikesCount: number,
      myStatus: string,
      newestLikes: NewestLikeTypePost[];
        
      
    }
  }

  export type PaginatedPost<T> = {
    pagesCount: number,
    page: number,
    pageSize: number,
    totalCount: number,
    items: T[],
  }
  export type postsType =
  {
    id: string,
    title: string,
    shortDescription: string,
    content: string,
    blogId: string,
    blogName: string,
    createdAt: string
  }