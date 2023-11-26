import { Request, Response, Router,  } from "express"
import { AuthModel, BlogModel, CommentModel, DeviceModel, PostModel, RateLimitModel, UserModel } from "../db/db";


export const testingRouter = Router()

class TestingController {
  static async deleteAllData(req: Request, res: Response) {
    await Promise.all([
      BlogModel.deleteMany({}),
      PostModel.deleteMany({}),
      UserModel.deleteMany({}),
      CommentModel.deleteMany({}),
      DeviceModel.deleteMany({}),
      RateLimitModel.deleteMany({}),
      AuthModel.deleteMany({}),
    ]);
    return res.status(204).send('All data is deleted');
  }
}

testingRouter.delete('/all-data', TestingController.deleteAllData);

