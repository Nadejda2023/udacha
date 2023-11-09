import { UserModel } from "../db/db"
import { TUsersPagination } from "../hellpers/pagination"
import { PaginatedUser, UsersModel } from "../models/usersModel"
import { log } from "console"



export const usersQueryRepository = {
    async findUsers(pagination: TUsersPagination):
    Promise<PaginatedUser<UsersModel>> {
       const filter = {$or: [{email: { $regex: pagination.searchEmailTerm, $options: 'i'}}, {login: { $regex: pagination.searchLoginTerm, $options: 'i'}}]} 
       const result = await UserModel.find(filter, {projection: {_id: 0, passwordSalt: 0, passwordHash: 0, emailConfirmation: 0, refreshTokenBlackList: 0}})
   
   .sort({[pagination.sortBy]: pagination.sortDirection})
   .skip(pagination.skip)
   .limit(pagination.pageSize)
   .lean()

   log(result)
       const totalCount: number = await UserModel.countDocuments(filter)
       const pageCount: number = Math.ceil(totalCount / pagination.pageSize)


   return {
       pagesCount: pageCount,
       page: pagination.pageNumber,
       pageSize: pagination.pageSize,
       totalCount: totalCount,
       items: result
       }
   },


async createUser(users: UsersModel) {
    await UserModel.insertMany([users])
},
async findUserById(id: string): Promise<UsersModel | null> {
    let foundedUser = await UserModel.findOne({id: id},{projection: {_id: 0, passwordSalt: 0, passwordHash: 0, emailConfirmation: 0, refreshTokenBlackList: 0}})
    if (!foundedUser) {
        return null
    } return foundedUser;
},

async findByLoginOrEmail(loginOrEmail: string) {
    const user = await UserModel.findOne({ $or: [{ email: loginOrEmail}, { login: loginOrEmail}]})
    return user
}, 
async findTokenInBL(userId: string, token: string):Promise<boolean>{
    const userByToken = await UserModel.findOne({id: userId, refreshTokenBlackList: {$in: [token]}})
    return !!userByToken;
},
async findUserByToken(refreshToken:string):Promise<UsersModel | null>{
    const foundedUser = await UserModel.findOne({refreshToken: refreshToken},{projection: {_id: 0, passwordSalt: 0, passwordHash: 0, emailConfirmation: 0, refreshTokenBlackList: 0}})
    return foundedUser
},
}