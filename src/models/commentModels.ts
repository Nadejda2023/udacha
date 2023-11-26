import { Int32 } from "mongodb"

  export type commentViewModel = {
  id: string,
  content: string,
  postId: string,
  commentatorInfo: {
    userId: string
  userLogin: string
  }
  createdAt: string
  }

  export type commentDBViewModel = { 
  id: string,
  content: string,
  postId: string,
  commentatorInfo: {
    userId: string
  userLogin: string
  }
  createdAt: string,
  likesInfo: {
    likesCount: number, 
    dislikesCount:  number,
    myStatus: string,
  }
}

  export class commentDBViewModelType {
    constructor(
     public id: string,
     public content: string,
     public postId: string,
     public commentatorInfo: {
      userId: string
    userLogin: string
    },
    public createdAt: string
    
     ) { }
    }   

  export type PaginatedCommentViewModel<T> = {
    pagesCount: number,
    page: number,
    pageSize: number,
    totalCount: number,
    items: T[],
  }
  