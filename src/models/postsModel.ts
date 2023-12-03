import {WithId } from "mongodb"

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
  export class PostsViewDBModelType {
    constructor(
     public id: string,
     public title: string,
     public shortDescription: string,
     public content: string,
     public blogId: string,
     public blogName: string,
     public createdAt: string,
     ) { }
    }   
  export type PostViewDBModel = { 
    id: string,
    title: string,
    shortDescription: string,
    content: string,
    blogId: string,
    blogName: string,
    createdAt: string,
  }

  export type PaginatedPost<T> = {
    pagesCount: number,
    page: number,
    pageSize: number,
    totalCount: number,
    items: T[],
  }