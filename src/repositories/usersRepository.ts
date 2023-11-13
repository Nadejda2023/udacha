import {  UserModel } from "../db/db"
import { UsersModel, UsersModelSw } from "../models/usersModel"

export const usersRepository = [
    {
        id: 1,
        loginPassword: 'Basic YWRtaW46cXdlcnR5',
    }
] 

export const usersTwoRepository = {

async deleteAllUsers(): Promise<boolean> {
    const result = await UserModel.deleteMany({})
    return result.acknowledged  === true

},

async deleteUsers(id: string) {
    const result = await UserModel.deleteOne({id:id})
    return  result.deletedCount === 1
    
},

async findUserByEmail(email: string) {
    const user = await UserModel.findOne({email})
    return user
}, 

async findByLoginU(login: string) {
    const user = await UserModel.findOne({login: login})
    return user
},

async saveUser ( user: UsersModel): Promise<UsersModel> {
    const result = await UserModel.insertMany([user])
    return user
},

async findUserById(id: string): Promise<UsersModel | null> {
    let result = await UserModel.findOne({id:id})
    if(result) {
        return result
    } else {
        return null
    }
    }, 

async findUserByConfirmationCode(code: string): Promise<UsersModel | null>{
    try {
        const user = await UserModel.findOne({"emailConfirmation.confirmationCode": code})
        return user
    } catch (error) {
        console.error("Error finding user by confirmation code:", error);
        throw error;
    }
    },

async findByLoginOrEmail(loginOrEmail: string): Promise<UsersModel | null> { 
        const user = await UserModel.findOne({$or: [{"email": loginOrEmail}, {"userName": loginOrEmail}]})
        return user
    },
async updateConfirmation(id:string): Promise<boolean> {
        let result = await UserModel
        .updateOne({id: id}, {$set:{"emailConfirmation.isConfirmed": true}})
        return result.modifiedCount === 1
    },
async updateCode(id:string, code: string, expirationDate: Date): Promise<boolean>{
        let result = await UserModel
        .updateOne({id: id}, {$set:{"emailConfirmation.confirmationCode": code, "emailConfirmation.expiritionDate": expirationDate}})
        return result.modifiedCount === 2
    },

}

