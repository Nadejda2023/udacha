import  request  from 'supertest';
import { app } from '../../src/setting';
import { UsersInputModel, UsersModel, UsersModelSw } from '../../src/models/usersModel';



export const createUser = (data: UsersInputModel) => {
    return request(app)
            .post('/users')
            .auth('admin', 'qwerty')
            .send(data)
}