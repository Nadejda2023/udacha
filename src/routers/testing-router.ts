import { Request, Response, Router,  } from "express"
import { postsRepository} from "../repositories/posts_db__repository";
import { usersTwoRepository } from "../repositories/usersRepository";
import { commentQueryRepository } from "../repositories/commentQueryRepository";
import { BlogModel, CommentModel, PostModel, UserModel } from "../db/db";


export const testingRouter = Router()

testingRouter.delete('/all-data',
async (req: Request, res: Response) => {
    await  Promise.all([
      BlogModel.deleteMany({}),
      PostModel.deleteMany({}),
      UserModel.deleteMany({}),
      CommentModel.deleteMany({}),])
    
    //await authQueryRepository.deleteAllAuth()
   return res.status(204).send('All data is deleted')
})
/*export const testingRouter = Router()

  testingRouter.delete('/all-data', async (req: Request, res: Response) => {
  await Promise.all([blogsRepository.deleteAllBlogs(),
    postsRepository.deleteAllPosts()]);
    res.status(204).send('All data is deleted')
})*/
