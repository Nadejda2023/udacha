import { WithId } from "mongodb"
import { AuthModel, UserModel } from "../db/db"
import { AuthViewModel } from "../models/authModels"
import { usersTwoRepository } from "./usersRepository"
import { randomUUID } from "crypto"
import { add } from "date-fns"
import { emailAdapter } from "../adapters/email-adapter"
import { CreateUserModel, UserType, UsersModel } from "../models/usersModel"
import { accessTokenSecret1, refreshTokenSecret2 } from "../setting"
import * as bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { usersQueryRepository } from "./usersQuery_Repository"


export class AuthRepository {
    async findMe():Promise<WithId<AuthViewModel> | null>  {
        const result : WithId<AuthViewModel> | null = await AuthModel.findOne({}, {projection: {_id: 0}})

            return result
    }
    async deleteAllAuth(): Promise<boolean> {
        const result = await AuthModel.deleteMany({})
      
        return result.acknowledged  === true
    
        
    }   
    async confirmEmail(code: string): Promise<boolean> {
        let user = await usersTwoRepository.findUserByConfirmationCode(code) 
        if(!user) return false 
        if (user.emailConfirmation.isConfirmed) return false;
        if (user.emailConfirmation.confirmationCode !== code) return false;
        if (user.emailConfirmation.expirationDate < new Date()) return false;
      
            let result = await usersTwoRepository.updateConfirmation(user.id)
            
            return result   
    }
    async ressendingEmail(email: string): Promise<boolean | null> {
        let user = await usersTwoRepository.findUserByEmail(email)
        if(!user) return false;
        if (user.emailConfirmation.isConfirmed) return false;
     
          const confirmationCode = randomUUID()
          const expiritionDate = add(new Date(), {
              hours: 1,
              minutes: 2
          })
          await usersTwoRepository.updateCode(user.id, confirmationCode, expiritionDate);
  
          try{
              await emailAdapter.sendEmail(user.email, 'code', confirmationCode)
          } catch(error){
              
          }
          return true
         
    }
    async findUserByID(userId: string): Promise<UsersModel | null> {
        try {
        const user = await UserModel.findOne({ id: userId })
        return user;
        } catch (error) {
        console.error('Error finding user by ID:', error);
        return null
        }
    }
    
    async _generateHash(password: string, salt: string){
        const hash = await bcrypt.hash(password,salt)
        return hash
    }

    async validateRefreshToken(refreshToken: string): Promise<any>{
        try {
         const payload = jwt.verify(refreshToken, refreshTokenSecret2);
        return payload;
        } catch (error) {
        return null; 
        }
    }

    async validateAccessToken(accessToken: string | undefined): Promise<any>{
        if(!accessToken){
            return null
        }
        try {
         const payload = jwt.verify(accessToken, accessTokenSecret1)
            return payload;
        } catch (error) {
            console.error('Token validation error:', error);
        return null; 
        }
    }

    async refreshTokens(userId: string, deviceId: string):
        Promise<{ accessToken: string, newRefreshToken: string }> {
        try {
        const accessToken = jwt.sign({ userId }, accessTokenSecret1 , { expiresIn: '10m' });
        const newRefreshToken = jwt.sign({ userId , deviceId }, refreshTokenSecret2, { expiresIn: '20m' });
        return { accessToken, newRefreshToken };
        } catch (error) {
        throw new Error('Failed to refresh tokens');
        }
    }

    async decodeRefreshToken(refreshToken: string) {
        try {
        const decoded = jwt.verify(refreshToken, refreshTokenSecret2);
        return decoded;
        } catch (error) {
        return null;
        }
    }

    async resetPasswordWithRecoveryCode( id:string, newPassword: string): Promise<any> {
        const newPaswordSalt = await bcrypt.genSalt(10) 
        const newHashedPassword = await this._generateHash(newPassword, newPaswordSalt)
        await UserModel.updateOne({ id }, { $set: { passwordHash: newHashedPassword, passwordSalt: newPaswordSalt} })
        return { success: true };
        }

        async createUser(login: string, email: string, password: string): Promise<CreateUserModel> { 
        
            const passwordSalt = await bcrypt.genSalt(10) 
            const passwordHash = await this._generateHash(password, passwordSalt) 
    
            const newUser: UserType = {
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
                   
                       
               }
               
            }
           await usersQueryRepository.createUser({...newUser})
            
            try {
                emailAdapter.sendEmail
               (newUser.email, 'code', newUser.emailConfirmation.confirmationCode) //сделаиь метод для отправки письма
               } catch(error){
                   console.error('create email error:',error)               
               }
               return {
                   id: newUser.id,
                   login,
                   createdAt: newUser.createdAt,
                   email: newUser.email
            }
           }
           async checkCredentials(loginOrEmail: string, password:string) {
            const user  = await usersQueryRepository.findByLoginOrEmail(loginOrEmail)
            if (!user) {
                
                return false
            } 
            const passwordHash = await this._generateHash(password,user.passwordSalt)
            if(user.passwordHash !== passwordHash) {  
            return false
            }
 
            return user
        }
 
}

    export const authRepository = new AuthRepository