import { Request, Response, Router,  } from "express"
import { AuthModel, BlogModel, CommentModel, DeviceModel, PostModel, RateLimitModel, UserModel } from "../db/db";


export const testingRouter = Router()

testingRouter.delete('/all-data',
async (req: Request, res: Response) => {
    await  Promise.all([
      BlogModel.deleteMany({}),
      PostModel.deleteMany({}),
      UserModel.deleteMany({}),
      CommentModel.deleteMany({}),
      DeviceModel.deleteMany({}),
      RateLimitModel.deleteMany({}),
      AuthModel.deleteMany({}),
    ])
    
    //await authQueryRepository.deleteAllAuth()
   return res.status(204).send('All data is deleted')
})
/*export const testingRouter = Router()

  testingRouter.delete('/all-data', async (req: Request, res: Response) => {
  await Promise.all([blogsRepository.deleteAllBlogs(),
    postsRepository.deleteAllPosts()]);
    res.status(204).send('All data is deleted')
})*/
