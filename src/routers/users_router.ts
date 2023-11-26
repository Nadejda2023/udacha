import { Request, Response, Router } from "express";
import { UserService } from "../domain/users-service";
import { getUsersPagination } from "../hellpers/pagination";
import { usersQueryRepository } from "../repositories/usersQuery_Repository";
import { authorizationValidation} from "../middlewares/inputvalidationmiddleware";
import { PaginatedUser, UsersModel } from "../models/usersModel";
import { UsersInputValidation } from "../middlewares/usersvalidation";
import { authQueryRepository } from "../repositories/authQueryRepositorii";


export const usersRouter = Router({})

class UsersController {
    private usersService: UserService
    constructor() {
        this.usersService = new UserService
    }
    async createUser(req: Request, res: Response) {
        const newUser = await authQueryRepository.createUser(req.body.login, req.body.email, req.body.password)
        if(!newUser) {
            res.sendStatus(401)
        } else {
            res.status(201).send(newUser)
        }
    }
    async getUser(req: Request, res: Response) : Promise<void> {
        const pagination = getUsersPagination(req.query)
        const foundAllUsers: PaginatedUser<UsersModel> = await usersQueryRepository.findUsers(pagination)
        res.status(200).send(foundAllUsers)
    }
    async deleteUserId( req: Request, res: Response) {
        const isDeleted = await this.usersService.deleteUserById(req.params.id)
        if (isDeleted) {
            res.sendStatus(204);
        } else {
            res.sendStatus(404);
        }
        }
}

const usersControllerInstance = new UsersController()

usersRouter.get ( '/', 
usersControllerInstance.getUser.bind(usersControllerInstance)
)

usersRouter.post ( '/', 
authorizationValidation,
UsersInputValidation,
usersControllerInstance.createUser.bind(usersControllerInstance)
)

usersRouter.delete('/:id',
authorizationValidation,
usersControllerInstance.deleteUserId.bind(usersControllerInstance)
)