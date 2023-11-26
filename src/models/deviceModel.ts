import { ObjectId } from "mongodb"

export type DeviceDbModel =
{
    _id: ObjectId
    ip : string,
    title : string,
    lastActiveDate:string,
    deviceId : string,
    userId: string
}
export class DeviceDbModelType {
    constructor(
     public _id: ObjectId,
     public ip : string,
     public title : string,
     public lastActiveDate:string,
     public deviceId : string,
     public userId: string
     ) { }
    }   
export type DeviceViewModel =
{
    ip : string,
    title : string,
    lastActiveDate:string,
    deviceId : string
}
