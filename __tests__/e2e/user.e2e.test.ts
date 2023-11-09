
import request from 'supertest'
import { authorizationValidation } from "../../src/middlewares/inputvalidationmiddleware"
import { RouterPaths, app } from "../../src/setting";
import { sendStatus } from '../../src/routers/sendStatus';
import { UsersInputModel, UsersModel, UsersModelSw } from '../../src/models/usersModel';
import { blogsCollection, usersCollection } from '../../src/db/db';
import { BlogsViewModel } from '../../src/models/blogsModel';
import { createUser } from './user-tests-helper';


const getRequest = () => {
    return request(app)
}
describe('tests for /users', () => {
    beforeAll(async () => {
        await getRequest()
        .delete('/testing/all-data')
    })
      
    /*beforeAll(async () => {
        authorizationValidation 
    }) */
    let users: any;
      
    it("should return 200 and users", async () => {
        users = await getRequest()
                .get(RouterPaths.users)
                .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
              .expect(sendStatus.OK_200)
    })

    it("shouldn't create a new user without auth", async () => {
        const users = await getRequest()
                .post(RouterPaths.users)
                .send({})
                .expect(sendStatus.UNAUTHORIZED_401)

                await getRequest().post(RouterPaths.users)
                .auth('login', 'password')
                .send({})
                .expect(sendStatus.UNAUTHORIZED_401) 
    })
    it ("shouldn't create a new blog with incorrect input data", async () => {
        users = await getRequest().post(RouterPaths.users).set('Authorization', 'Basic YWRtaW46cXdlcnR5')
        const data: UsersModel = {
            id: '',
            login: '',
            email: '',
            createdAt: '',
            passwordSalt: '',
            passwordHash: '',
            emailConfirmation : {
                isConfirmed: false,
                confirmationCode: '',
                expirationDate: new Date
            },
            refreshTokenBlackList: []
        }
        
        await getRequest()
                .post(RouterPaths.users)
                .send(data)
                .expect(sendStatus.UNAUTHORIZED_401)
        
        await getRequest()
                .get(RouterPaths.users)
                .expect(sendStatus.OK_200)
    })
    let createdUser1: UsersModel


    it ("should create a new user with correct input data", async () => {
        users = await getRequest().post(RouterPaths.users).set('Authorization', 'Basic YWRtaW46cXdlcnR5')
        const countOfUsersBefore = await usersCollection.countDocuments()
        expect(countOfUsersBefore).toBe(0)
        const inputModel: UsersInputModel = {
            
            login: 'frxjjxxx',
            email: 'xjgxjgh@gmail.com',
            password: 'jhfu3hgiuwhg',
        }

        const createResponse = await createUser(inputModel)

        expect(createResponse.status).toBe(sendStatus.CREATED_201)

        let createdUser1 = createResponse.body
        expect(createdUser1).toEqual({
                id: expect.any(String),
                login: inputModel.login,
                email: inputModel.email,
                createdAt: expect.any(String),              
            
        })
            
        const countOfUsersAfter = await usersCollection.countDocuments()
        expect(countOfUsersAfter).toBe(1)
    
        
        const getByIdRes = await getRequest().get(`${RouterPaths.users}`)
            console.log('getUser:', getByIdRes.status, getByIdRes.body)
        expect(getByIdRes.status).toBe(sendStatus.OK_200)
        expect(getByIdRes.body.items[0]).toEqual(createdUser1)
        
        

        createdUser1 = createResponse.body
        expect.setState({ user1: createUser})
    })

    it ("shouldn't create a new user with incorrect input data", async () => {
        users = await getRequest().post(RouterPaths.users).set('Authorization', 'Basic YWRtaW46cXdlcnR5')
        const inputModel: UsersInputModel = {
            
            login: 'fr',
            email: 'xjgxjgh',
            password: 'jhfu',
        }

        const createResponse = await createUser(inputModel)

        expect(createResponse.status).toBe(400)

        
    })

    it("should return 401 for post./users", async () => {
        users = await getRequest()
                .post(RouterPaths.users)
                .set('Authorization', 'Basic YWRtaW46cXdl')
              .expect(401)
    })

    it ("should delete both user", async () => {
        users = await getRequest().post(RouterPaths.users).set('Authorization', 'Basic YWRtaW46cXdlcnR5')
        const {user1, user2} = expect.getState()
        
        await getRequest()
                .delete(`${RouterPaths.users}/${user1.id}`)   // be blog1.id
                .auth('admin', 'qwerty')
                .expect(sendStatus.NO_CONTENT_204) 

        await getRequest()
                .get(`${RouterPaths.users}/${user1.id}`)
                .expect(sendStatus.NOT_FOUND_404)

        await getRequest()
                .delete(`${RouterPaths.users}/${user2.id}`)
                .auth('admin', 'qwerty')
                .expect(sendStatus.NO_CONTENT_204)
        
        await getRequest()
                .get(`${RouterPaths.users}/${user2.id}`)
                .expect(sendStatus.NOT_FOUND_404)

           
    })
    //expect(users.body.items.length).toBe(0)


})