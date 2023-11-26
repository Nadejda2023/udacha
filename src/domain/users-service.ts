import {  UsersModel } from "../models/usersModel"
import * as bcrypt from 'bcrypt'
import { UserTwoRepository} from "../repositories/usersRepository"
import { UserModel } from "../db/db"



export class UserService {
    usersTwoRepository: UserTwoRepository
    constructor(){
        this.usersTwoRepository= new UserTwoRepository()
    }
   
   
       async findUserById(id:string): Promise<UsersModel | null> {
           const foundedUser = await UserModel.findOne({id: id},{projection: {_id: 0, passwordSalt: 0, passwordHash: 0, emailConfirmation: 0, refreshTokenBlackList: 0}})
           
           if(!foundedUser){
               return null
           } return foundedUser
           
       }

       
       async _generateHash(password: string, salt: string){
           const hash = await bcrypt.hash(password,salt)
           return hash
       }
      
       async deleteUserById(id: string): Promise<boolean> {
           return await this.usersTwoRepository.deleteUsers(id)
       } 

     

}
export const userService = new UserService();




