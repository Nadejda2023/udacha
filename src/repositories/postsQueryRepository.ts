import { WithId } from "mongodb"
import { CommentModel, PostModel } from "../db/db"
import { TPagination } from "../hellpers/pagination"
import { PaginatedPost, PostViewDBModel} from "../models/postsModel"
import { CommentDB, PaginatedCommentViewModel, commentViewModel, commentViewType } from "../models/commentModels"
import { randomUUID } from "crypto"

 export class PostsQueryRepository {
    async findPosts(pagination: TPagination):
    Promise<PaginatedPost<PostViewDBModel>> {
       const filter = {name: { $regex :pagination.searchNameTerm, $options: 'i'}}
       const result : WithId<WithId<PostViewDBModel>>[] = await PostModel.find
       (filter, {projection: {_id: 0}})
   
   .sort({[pagination.sortBy]: pagination.sortDirection})
   .skip(pagination.skip)
   .limit(pagination.pageSize)
   .lean()
       const totalCount: number = await PostModel.countDocuments(filter)
       const pageCount: number = Math.ceil(totalCount / pagination.pageSize)

   return {
       pagesCount: pageCount,
       page: pagination.pageNumber,
       pageSize: pagination.pageSize,
       totalCount: totalCount,
       items: result
       }
   }

   async createPostComment(postId: string, content: string, 
    commentatorInfo: {userId:string, userLogin: string}):
   Promise <commentViewType> {
      
      const createCommentForPost = {
            id: randomUUID(),
            content, 
            commentatorInfo,
            createdAt: new Date().toISOString(),
            //postId,
            likesInfo: {
                likesCount: 0,
                dislikesCount: 0,
                myStatus: 'None',
              },
    }
       await CommentModel.create(createCommentForPost)
        return  {
        id: createCommentForPost.id,
        content: createCommentForPost.content,
        commentatorInfo: createCommentForPost.commentatorInfo,
        createdAt: createCommentForPost.createdAt,
        //postId: createCommentForPost.postId,
        likesInfo: {
            likesCount: createCommentForPost.likesInfo.likesCount,
            dislikesCount: createCommentForPost.likesInfo.dislikesCount,
            myStatus: createCommentForPost.likesInfo.myStatus,
          },
    }
  }

   async getAllCommentsForPost(pagination: TPagination):
    Promise<PaginatedCommentViewModel<CommentDB>> {
       const filter = {name: { $regex :pagination.searchNameTerm, $options: 'i'}}
       const result : WithId<WithId<CommentDB>>[] = await CommentModel.find
       (filter, {projection: {_id: 0}})
   
   .sort({[pagination.sortBy]: pagination.sortDirection})
   .skip(pagination.skip)
   .limit(pagination.pageSize)
   .lean()
       const totalCount: number = await CommentModel.countDocuments(filter)
       const pageCount: number = Math.ceil(totalCount / pagination.pageSize)

   return {
       pagesCount: pageCount,
       page: pagination.pageNumber,
       pageSize: pagination.pageSize,
       totalCount: totalCount,
       items: result
       }
   }
 }

 export const postsQueryRepository = new PostsQueryRepository
