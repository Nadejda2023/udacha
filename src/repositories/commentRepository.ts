import { WithId } from "mongodb"
import { CommentModel} from "../db/db"
import { TPagination } from "../hellpers/pagination"
import { CommentDB, PaginatedCommentViewModel, commentViewModel, commentViewType } from "../models/commentModels"
import { UsersModel } from "../models/usersModel"

 export class CommentRepository {
    async getAllCommentsForPost(postId:string, pagination:TPagination, user: UsersModel | null): 
    Promise<PaginatedCommentViewModel<commentViewType>> {
        
        const result : WithId<WithId<CommentDB>>[] = await CommentModel.find
        ({postId: postId}, {projection: {_id: 0, postId: 0}}) //filter
    
    .sort({[pagination.sortBy]: pagination.sortDirection})
    .skip(pagination.skip)
    .limit(pagination.pageSize)
    .lean()
        const totalCount: number = await CommentModel.countDocuments({postId})
        const pageCount: number = Math.ceil(totalCount / pagination.pageSize)
        

        const response: PaginatedCommentViewModel<commentViewType> = {
        pagesCount: pageCount,
        page: pagination.pageNumber,
        pageSize: pagination.pageSize,
        totalCount: totalCount,
        items: result.map(item => CommentDB.getViewModel(user,item))
        }
        return response
    }
   
    async findCommentById(commentId: string): Promise<CommentDB| null> {
        //return CommentModel.findOne({id: commentId}, {_id: 0, postId: 0, __v: 0, statuses: 0})
        return CommentModel.findOne({id: commentId})

    }

    async updateCommentLikeStatus(existingComment: CommentDB): Promise<CommentDB | undefined | boolean> {
        try {
           
            const result = await CommentModel.updateOne({ id: existingComment.id }, {
                 $set: {  
            'likesInfo.likesCount': existingComment.likesInfo.likesCount,
            'likesInfo.dislikesCount': existingComment.likesInfo.dislikesCount,
            'likesInfo.statuses': existingComment.likesInfo.statuses } });
            
            if (result === undefined) {
                return undefined;
              }
            return result.modifiedCount === 1;
          
            
          } catch (error) {
            console.error('Error updating comment:', error);
            
            return undefined;
      
          }

    }

    async deleteAllComment(): Promise<boolean> {
        const result = await CommentModel.deleteMany({})
      
        return result.acknowledged  === true
      
    }

    async updateComment(commentId: string, content: string ) : Promise<CommentDB | undefined | boolean> {
        let foundComment = await CommentModel.findOne({id: commentId}, {projection: {_id: 0, postId: 0}})
        if(foundComment){
        const result = await CommentModel.updateOne({id: commentId},{ $set:{content: content}}) //comentatorInfo: comentatorInfo
        return result.matchedCount === 1
        }
    }

    async deleteComment(commentId: string){
        const result = await CommentModel.deleteOne({id: commentId})
        return  result.deletedCount === 1
    }
     }
 export const commentRepository = new CommentRepository()