import { WithId } from "mongodb"

export type BlogsInputViewModel = {

    name: string,
    description: string,
    websiteUrl: string,
}

export type BlogsViewModel = {
    id: string,
    name: string,
    description: string,
    websiteUrl: string,
    createdAt: string,
    isMembership: boolean,
}

export type BlogsViewDBModel = { 
    id: string,
    name: string,
    description: string,
    websiteUrl: string,
    createdAt: string,
    isMembership: boolean,
    }

 export class BlogsViewDBModelType {
    constructor(
     public name: string,
     public description: string,
     public websiteUrl: string,
     public createdAt: string,
     public isMembership: boolean,
     ) {}
    }   
export type PaginatedBlog<T> = {
    pagesCount: number,
    page: number,
    pageSize: number,
    totalCount: number,
     items: T[],
}
export type blogsType = {
    id:  string,
    name: string,
    description: string,
    websiteUrl: string, 
    createdAt: string,
    isMembership: boolean 
  }
  
