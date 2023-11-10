import { WithId } from "mongodb"
import { AuthModel, UserModel } from "../db/db"
import { AuthViewModel } from "../models/authModels"




export const authQueryRepository = {
    async findMe():Promise<WithId<AuthViewModel> | null>  {
        const result : WithId<AuthViewModel> | null = await AuthModel.findOne({}, {projection: {_id: 0}})

            return result
    },
    async deleteAllAuth(): Promise<boolean> {
        const result = await AuthModel.deleteMany({})
      
        return result.acknowledged  === true
    
        
    },

    
    

    
    
        
    }
