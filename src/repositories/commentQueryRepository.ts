import { WithId } from "mongodb"
import { CommentModel} from "../db/db"
import { TPagination } from "../hellpers/pagination"
import { PaginatedCommentViewModel, commentDBViewModel, commentViewModel } from "../models/commentModels"




export const commentQueryRepository = {
    async getAllCommentsForPost(postId:string, pagination:TPagination): // postId:string
    Promise<PaginatedCommentViewModel<commentDBViewModel>> {
        //const filter = {name: { $regex :pagination.searchNameTerm, $options: 'i'}}
        const result : WithId<WithId<commentDBViewModel>>[] = await CommentModel.find({postId: postId}, {projection: {_id: 0, postId: 0}}) //filter
    
    .sort({[pagination.sortBy]: pagination.sortDirection})
    .skip(pagination.skip)
    .limit(pagination.pageSize)
    .lean()
        const totalCount: number = await CommentModel.countDocuments({postId})
        const pageCount: number = Math.ceil(totalCount / pagination.pageSize)


        const response: PaginatedCommentViewModel<commentDBViewModel> = {
        pagesCount: pageCount,
        page: pagination.pageNumber,
        pageSize: pagination.pageSize,
        totalCount: totalCount,
        items: result
        }
        return response
    },
   
    
    async findCommentById(commentId: string): Promise<commentDBViewModel | null> {
        return CommentModel.findOne({id: commentId}, {projection: {_id: 0, postId: 0}})

    },


    async deleteAllComment(): Promise<boolean> {
        const result = await CommentModel.deleteMany({})
      
        return result.acknowledged  === true
    
        
    },

    async updateComment(commentId: string, content: string ) : Promise<commentDBViewModel | undefined | boolean> {
        let foundComment = await CommentModel.findOne({id: commentId})
        if(foundComment){
        const result = await CommentModel.updateOne({id: commentId},{ $set:{content: content}}) //comentatorInfo: comentatorInfo
        return result.matchedCount === 1
        }
    },
    async deleteComment(commentId: string){
    const result = await CommentModel.deleteOne({id: commentId})
    return  result.deletedCount === 1
 }
}