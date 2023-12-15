import { WithId } from "mongodb"
import { CommentModel, LikeStatusTypePost, PostModel } from "../db/db"
import { TPagination } from "../hellpers/pagination"
import { PaginatedPost, PostViewModel2, PostsDBModels} from "../models/postsModel"
import { CommentDB, PaginatedCommentViewModel, commentViewModel, commentViewType } from "../models/commentModels"
import { randomUUID } from "crypto"

 export class PostsQueryRepository {
    async findPosts(pagination: TPagination):
    Promise<PaginatedPost<PostViewModel2>> {
       const filter = {name: { $regex :pagination.searchNameTerm, $options: 'i'}}
       const result : WithId<WithId<PostViewModel2>>[] = await PostModel.find
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
   async updatePostLikeStatus(existingPost: PostsDBModels, latestLikes: LikeStatusTypePost[]){
    console.log(JSON.stringify(existingPost))
    try {
        const result = await PostModel.updateOne({ id: existingPost.id }, {
            $set: {  
       'extendedLikesInfo.likesCount': existingPost.extendedLikesInfo.likesCount ,
       'extendedLikesInfo.dislikesCount': existingPost.extendedLikesInfo.dislikesCount,
       'extendedLikesInfo.myStatus': existingPost.extendedLikesInfo.myStatus,
       'extendedLikesInfo.newestLikes': latestLikes,
    }});
       console.log('result:', result);
       if (result === undefined) {
           return undefined;
         }
       return result.modifiedCount === 1;
    } catch (error) {
        console.error('Error updating post:', error);
        
        return undefined;
  
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
            postId,
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
