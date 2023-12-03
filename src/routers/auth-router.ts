import {Request, Response, Router} from 'express'
import { JwtService } from '../_application/jwt-service'
import { authMiddleware } from '../middlewares/auth-middleware'
import { UsersInputValidation, emailConfiResValidation, registrationComfiValidation } from '../middlewares/usersvalidation'
import { usersQueryRepository } from '../repositories/usersQuery_Repository'
import { randomUUID } from 'crypto'
import { customRateLimit } from '../middlewares/middleware_rateLimit'
import { DeviceDbModel} from '../models/deviceModel'
import { ObjectId } from 'mongodb'
import { deviceQueryRepository } from '../repositories/deviceQueryRepository'
import { DeviceModel, UserModel } from '../db/db'
import { emailAdapter } from '../adapters/email-adapter'
import { forCreateNewPasswordValidation } from '../middlewares/authres'
import { authRepository } from '../repositories/authRepositori'



class AuthController{
  private jwtService: JwtService
  constructor() {
    this.jwtService = new JwtService
  }
  
  async createAuthUser( req: Request, res: Response){
    const user = await authRepository.checkCredentials(req.body.loginOrEmail, req.body.password) 
    if (user) {
        const deviceId = randomUUID()
        const userId = user.id
        const accessToken = await this.jwtService.createJWT(user)
        const refreshToken = await this.jwtService.createJWTRT(userId, deviceId)
        const lastActiveDate = await this.jwtService.getLastActiveDate(refreshToken)
        const newDevice: DeviceDbModel =  {
            _id: new ObjectId(),
            ip: req.ip,
            title: req.headers['user-agent'] || 'title',
            lastActiveDate,
            deviceId,
            userId
        }
        await DeviceModel.insertMany([newDevice])
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true
          });
          
        res.status(200).json({accessToken})  
    } else {
        res.sendStatus(401) 
    }

}
  async createPasswordRecovery( req: Request, res: Response){
    const email = req.body.email;
      const user = await usersQueryRepository.findUserByEmail(email);
      
      if (!user) {        
        return res.sendStatus(204);
      } 
        const recoveryCode = Math.floor(100000 + Math.random() * 900000).toString();

       await UserModel.updateOne({ id: user.id }, { $set: {recoveryCode} });
         try { 
       emailAdapter.sendEmailWithRecoveryCode(user.email, recoveryCode); 
       return res.status(204).json({ message: 'Ok' });
      
    } catch (error) {
      console.error('create recovery code:',error);
      res.status(500).json({ error });
    }
  }
  async createNewPassword( req: Request, res: Response) {
    const { newPassword, recoveryCode } = req.body;
    const user = await UserModel.findOne({ recoveryCode });
  
 
     if (!user) {
       return res.status(400).json({
         errorsMessages: [
           {
             message: "send recovery code",
             field: "recoveryCode"
           }
         ]
       });
     }
    const result = await authRepository.resetPasswordWithRecoveryCode(user.id, newPassword);
    if (result.success) {
      return res.sendStatus(204);
    } }

    async createRefreshToken( req: Request, res: Response) {
      try {
          const refreshToken = req.cookies.refreshToken;
          if (!refreshToken) {
            return res.status(401).json({ message: 'no rt in cookie' });
          }

          const isValid = await authRepository.validateRefreshToken(refreshToken);
          if (!isValid) {
            return res.status(401).json({ message: 'rt secretinvalid or rt expired' });
          }
          
          const user = await usersQueryRepository.findUserById(isValid.userId);
          if (!user) {
             return res.status(401).json({ message: 'no user' });
            }
  
          const device = await DeviceModel.findOne({deviceId: isValid.deviceId})
          if(!device){
              return res.status(401).json({ message: 'no device' });
              }
  
          const lastActiveDate = await this.jwtService.getLastActiveDate(refreshToken)
          if (lastActiveDate !== device.lastActiveDate) {
              return res.status(401).json({ message: 'Invalid refresh token version' });
  
            }
          
          const newTokens = await authRepository.refreshTokens(user.id, device.deviceId); 
          const newLastActiveDate = await this.jwtService.getLastActiveDate(newTokens.newRefreshToken)
          await DeviceModel.updateOne({ deviceId: device.deviceId },{ $set: {lastActiveDate: newLastActiveDate}})
           
          res.cookie('refreshToken', newTokens.newRefreshToken, {
            httpOnly: true,
            secure: true,   
          });
          res.status(200).json({ accessToken: newTokens.accessToken });
        } catch (error) {
          console.error(error);
          res.status(500).json({ message: '' });
        }
      }
      async createRegistrationConfirmation( req: Request, res: Response) {
        const result = await authRepository.confirmEmail(req.body.code)
        if(result) {
          return res.sendStatus(204)
        } else {
           return res.status(400).send({
               errorsMessages: [
                   {
                       message: "test code",
                       field: "code"
                   }
               ]
           })   
       }
      }
      async createRegistration( req: Request, res: Response) {
        const user = await authRepository.createUser(req.body.login, req.body.email, req.body.password)
        if(user) {
        return res.sendStatus(204)
        } else {
            return res.status(400).send({
                errorsMessages: [
                    {
                        message: "email already confirmed",
                        field: "email"
                    }
                ]
            })   
        }
      }
      async createRegistrationEmailResending( req: Request, res: Response) {
        const result = await authRepository.ressendingEmail(req.body.email)
    if(result) {
        return res.status(204).send(`	
        Input data is accepted. Email with confirmation code will be send to passed email address. Confirmation code should be inside link as query param, for example: https://some-front.com/confirm-registration?code=youtcodehere`)
        } else {
            return res.status(400).send({
                errorsMessages: [
                    {
                        message: "email already confirmed",
                        field: "email"
                    }
                ]
            })   
        }
      }
      async createUserLogout( req: Request, res: Response) {
        try {
          const refreshToken = req.cookies.refreshToken;
          if (!refreshToken) {
            return res.status(401).json({ message: 'Refresh token not found' });
          }
          const isValid = await authRepository.validateRefreshToken(refreshToken);
          if (!isValid) {
            return res.status(401).json({ message: 'Invalid refresh token' });
          }
        
          const user = await usersQueryRepository.findUserById(isValid.userId);
          if(!user) return res.sendStatus(401);

          const device = await DeviceModel.findOne({deviceId: isValid.deviceId})
          if(!device){
          return res.status(401).json({ message: 'Invalid refresh token' });
          }

          const lastActiveDate = await this.jwtService.getLastActiveDate(refreshToken)
          if (lastActiveDate !== device.lastActiveDate) {
            return res.status(401).json({ message: 'Invalid refresh token' });
          }
        
          await deviceQueryRepository.deleteDeviceId(isValid.deviceId)

          res.clearCookie('refreshToken', { httpOnly: true, secure: true });
          res.sendStatus(204);
        } catch (error) {
          console.error(error);
          res.status(500).json({ message: 'Server error' });
        }
      }
      async createUserMe( req: Request, res: Response) {
           if(!req.user){
              return res.sendStatus(401)
            } else {
          return res.status(200).send({
            email: req.user.email,
            login: req.user.login,
            userId: req.user.id
        }
        )
      }
    }
}
export const authRouter = Router({})

const authControllerInstance = new AuthController()

  authRouter.post('/login',
  customRateLimit,
  authControllerInstance.createAuthUser.bind(authControllerInstance)
  )

  authRouter.post('/password-recovery',
  emailConfiResValidation,
  customRateLimit,
  authControllerInstance.createPasswordRecovery.bind(authControllerInstance)    
  )

  authRouter.post('/new-password',
  forCreateNewPasswordValidation,
  customRateLimit,
  authControllerInstance.createNewPassword.bind(authControllerInstance)
  )

  authRouter.post('/refresh-token',
  authControllerInstance.createRefreshToken.bind(authControllerInstance)
  )

  authRouter.post('/registration-confirmation',
  customRateLimit,
  registrationComfiValidation,
  authControllerInstance.createRegistrationConfirmation.bind(authControllerInstance)
  )  

  authRouter.post('/registration',
  customRateLimit,
  UsersInputValidation, 
  authControllerInstance.createRegistration.bind(authControllerInstance)
  )


  authRouter.post('/registration-email-resending',
  customRateLimit,
  emailConfiResValidation,
  authControllerInstance.createRegistrationEmailResending.bind(authControllerInstance)
  ) 

  authRouter.post('/logout',
  authControllerInstance.createUserLogout.bind(authControllerInstance)
        
  )

  authRouter.get('/me', 
  authMiddleware,
  authControllerInstance.createUserMe.bind(authControllerInstance)

  )