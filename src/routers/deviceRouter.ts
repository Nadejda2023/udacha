import {Request, Response, Router } from "express";
import { deviceQueryRepository } from "../repositories/deviceQueryRepository";
import { authQueryRepository } from "../repositories/authQueryRepositorii";

export const deviceRouter = Router({})


class DeviceController {
  async getDeviceByUserId(req: Request, res: Response){
    const refreshToken = req.cookies.refreshToken;
    console.log('refreshToken', refreshToken)
    
      if (!refreshToken) {
        return res.status(401).json({ message: 'Refresh token not found' });
      }
      const isValid = await authQueryRepository.validateRefreshToken(refreshToken);
  
      if (!isValid || !isValid.userId || !isValid.deviceId) {
        return res.status(401).json({ message: 'Invalid refresh token' });
      }
      const user = await authQueryRepository.findUserByID(isValid.userId)

      if (!user) {
      return res.status(401).json({ message: 'User not found' });
      }

      const device = await deviceQueryRepository.findDeviceById(isValid.deviceId);
      if (!device) {
      return res.status(401).json({ message: 'Device not found' });
      }

      if (isValid.userId !== device.userId) {
      return res.status(401).json({ message: 'Unauthorized access to device' });
      }


    const result = await deviceQueryRepository.getAllDeviceByUserId(isValid.userId)
    console.log(result)
    if(result) {
        res.status(200).send(result)
    } else {
         res.sendStatus(401)
         }
    }

    async deleteAllDeviceExceptOneDevice(req: Request, res: Response) {
      const refreshToken = req.cookies.refreshToken;
      const isValid = await authQueryRepository.validateRefreshToken(refreshToken);
        if (!isValid || !isValid.userId || !isValid.deviceId) {
        return res.status(401).json({ message: 'Unauthorized ' });
        }

      const result = await deviceQueryRepository.deleteAllExceptOne(isValid.userId,isValid.deviceId) // delete({userId, $..: deviceId})
        if(result) {
        res.sendStatus(204)
        } else {
        res.sendStatus(500)  
        }
      }
    async deleteDeviceById(req: Request, res: Response){
        const refreshToken = req.cookies.refreshToken;
        const deviceId = req.params.deviceId;
        const isValid = await authQueryRepository.validateRefreshToken(refreshToken);
          if (!isValid || !isValid.userId || !isValid.deviceId) {
            return res.status(401).json({ message: 'Unauthorized ' });
            }
    
        const user = await authQueryRepository.findUserByID(isValid.userId);
          if (!user) {
            return res.status(401).json({ message: 'User not found' });
          }
    
        const device = await deviceQueryRepository.findDeviceById(deviceId)//
            if (!device) {
            return res.sendStatus(404);
          }
    
            if (device.userId !== isValid.userId ) {
            return res.sendStatus(403);
          }
    
        await deviceQueryRepository.deleteDeviceId( deviceId)
            res.sendStatus(204)       
    }
}

const deviceControllerInstance = new DeviceController
deviceRouter.get ('/devices', deviceControllerInstance.getDeviceByUserId.bind(deviceControllerInstance)
 )


deviceRouter.delete ('/devices', deviceControllerInstance.deleteAllDeviceExceptOneDevice.bind(deviceControllerInstance)
 ) 


deviceRouter.delete ('/devices/:deviceId', deviceControllerInstance.deleteDeviceById.bind(deviceControllerInstance)
)
