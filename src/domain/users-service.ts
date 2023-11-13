import { CreateUserModel, UsersModel } from "../models/usersModel"
import * as bcrypt from 'bcrypt'
import { randomUUID } from "crypto"
import {  usersTwoRepository } from "../repositories/usersRepository"
import { usersQueryRepository } from "../repositories/usersQuery_Repository"
import { log } from "console"
import add from "date-fns/add"
import { emailAdapter } from "../adapters/email-adapter"
import { UserModel } from "../db/db"
import { id } from "date-fns/locale"



export const usersService = {
    async createUser(login: string, email: string, password: string): Promise<CreateUserModel> { 
        
         const passwordSalt = await bcrypt.genSalt(10) // получаем соль чем больше индекс тем она навороченнее
         const passwordHash = await this._generateHash(password, passwordSalt) //отправляем пароль и соль в метод где создаем хэш и записываем его в переменную

         const newUser: UsersModel = {
            id: randomUUID(),
            login: login,
            email,
            passwordHash,
            passwordSalt,
            createdAt: new Date().toISOString(),
            recoveryCode: randomUUID(),
            emailConfirmation: {
                confirmationCode: randomUUID(),
                expirationDate: add(new Date(), {
                    hours: 1,
                    minutes: 2
                }),
                isConfirmed: false,
                
                    
            },
            //refreshTokenBlackList:[]
         }
        await usersQueryRepository.createUser({...newUser})
         
         try {
             emailAdapter.sendEmail
            (newUser.email, 'code', newUser.emailConfirmation.confirmationCode) //сделаиь метод для отправки письма
            } catch(error){
                console.error('create email error:',error)
                //await usersTwoRepository.deleteUsers(user.id) 
                            
            }
         return {
            id: newUser.id,
            login,
            createdAt: newUser.createdAt,
            email: newUser.email
         };
        },
    

// to do
        async findUserById(id:string): Promise<UsersModel | null> {
            const foundedUser = await UserModel.findOne({id: id},{projection: {_id: 0, passwordSalt: 0, passwordHash: 0, emailConfirmation: 0, refreshTokenBlackList: 0}})
            
            if(!foundedUser){
                return null
            } return foundedUser
            
        },

        async checkCredentials(loginOrEmail: string, password:string) {
            const user  = await usersQueryRepository.findByLoginOrEmail(loginOrEmail)
            if (!user) {
                
                return false
            } // пара логин и пароль не то
            const passwordHash = await this._generateHash(password,user.passwordSalt)
            if(user.passwordHash !== passwordHash) {
                
                return false
            }

            return user
        }, 



        async _generateHash(password: string, salt: string){
            const hash = await bcrypt.hash(password,salt)
            //console.log('hash: ' + hash) 
            return hash
        },

       // async checkCredentials2( id: string ,newPassword:string) {
            //const user  = await UserModel.findOne({id:id})
            //if (!user) {
                
               // return false
            //} // пара логин и пароль не то
            //const passwordHash = await this._generateHash(newPassword, user.passwordSalt )
            //if(user.passwordHash !== passwordHash) {
                
            //    return false
            //}
            //return user
        //}, 
        async deleteUserById(id: string): Promise<boolean> {
            return await usersTwoRepository.deleteUsers(id)


        },

        async hashPassword(password: string): Promise<string> {
            return bcrypt.hash(password, 10);
          },

       
       async resetPasswordWithRecoveryCode( id:string, newPassword: string): Promise<any> {
      
        const newHashedPassword = await usersService.hashPassword(newPassword);

        await UserModel.updateOne({ id }, { $set: { passwordHash: newHashedPassword, recoveryCode: null} });
       
        return { success: true };
        }
    }
       
       
    
    
    
    
    
    
    
    

       
