import request from 'supertest' 
import mongoose from 'mongoose'
import { RouterPaths, app } from '../../src/setting'

describe('Mongoose integration', () => {
    const mongoURI = process.env.MONGO_URL || "mongodb://0.0.0.0:27017";
    
    beforeAll(async () => {
        /* Connecting to the database. */
        await mongoose.connect(mongoURI)
        await request(app).delete('/testing/all-data')
    })

    afterAll(async () => {
        /* Closing database connection after each test. */
        await mongoose.connection.close()
    })

    describe('testing of creation comments', () => {
        
        let adminCredentionalsInBase64: any;
       
        it('creation and login to user', async () => {
            
            adminCredentionalsInBase64 = Buffer.from("admin:qwerty").toString("base64")
            const createdUser = await request(app)
                .post('/users')
                .set("Authorization",`Basic ${adminCredentionalsInBase64}`)
                .send({
                    "login": "nadya223",
                    "password": "string",
                    "email": "fsklever@gmail.com"
                })
                .expect(201)
                
            expect(createdUser.body).toEqual({
                "id": expect.any(String),
                "createdAt": expect.any(String),
                "login": "nadya223",
                "email": "fsklever@gmail.com"
            })

            const loginOfUser = await request(app)
            .post('/auth/login')
            .send({
                "loginOrEmail": "nadya223",
                "password": "string",
            })
            .expect(200)

            const accessToken = loginOfUser.body.accessToken

            const createdBlog = await request(app)
            .post('/blogs')
            .set("Authorization",`Basic ${adminCredentionalsInBase64}`)
            .send({
                    "name": "123",
                    "description": "description",
                    "websiteUrl": "https://it-incubator.io/"
                  
            })
            .expect(201)

            const createdPost = await request(app)
            .post('/posts')
            .set("Authorization",`Basic ${adminCredentionalsInBase64}`)
            .send({
                "title": "title",
                "shortDescription": "shortDescription",
                "content": "content",
                "blogId": createdBlog.body.id
                  
            })
            .expect(201)

            const createdCommentForSpecificPost = await request(app)
            .post(`/posts/${createdPost.body.id}/comments`)
            .set('Authorization',`Bearer ${accessToken}`)
            .send({
                "content": "good comment 1 blablalba"   
            })
            .expect(201)
            
            expect(createdCommentForSpecificPost.body).toEqual(
                {
                    "id": expect.any(String),
                    "content": "good comment 1 blablalba",
                    "commentatorInfo": {
                      "userId": createdUser.body.id,
                      "userLogin": createdUser.body.login
                    },
                    "createdAt": expect.any(String),
                    "likesInfo": {
                      "likesCount": 0,
                      "dislikesCount": 0,
                      "myStatus": "None"
                    }
                  }
            )
            
                

    
            const foundedCommentById = await request(app)
            .get(`/comments/${createdCommentForSpecificPost.body.id}`)
            .set('Authorization',`Bearer ${accessToken}`)
            .expect(200)

            expect(foundedCommentById.body).toEqual({
                "id": createdCommentForSpecificPost.body.id,
                "content": "good comment 1 blablalba",
                "commentatorInfo": {
                  "userId": createdUser.body.id,
                  "userLogin": createdUser.body.login
                },
                "createdAt":expect.any(String),
                "likesInfo": {
                  "likesCount": 0,
                  "dislikesCount": 0,
                  "myStatus": "None"
                }
              })

              const updateCommentLikeStatus = await request(app)
            .put(`/comments/${createdCommentForSpecificPost.body.id}/like-status`)
            .set("Authorization",`Bearer ${accessToken}`)
            .send({
                    "likeStatus": "Like" 
            })
            .expect(204)

            const commentByIdAfterLike = await request(app)
            .get(`/comments/${createdCommentForSpecificPost.body.id}`)
            .set('Authorization',`Bearer ${accessToken}`)
            .expect(200)

            expect(commentByIdAfterLike.body).toEqual({
                "id": createdCommentForSpecificPost.body.id,
                "content": "good comment 1 blablalba",
                "commentatorInfo": {
                  "userId": createdUser.body.id,
                  "userLogin": createdUser.body.login
                },
                "createdAt":expect.any(String),
                "likesInfo": {
                  "likesCount": 1,
                  "dislikesCount": 0,
                  "myStatus": "Like"
                }
            })
            const updateCommenеDislikeStatus = await request(app)
            .put(`/comments/${createdCommentForSpecificPost.body.id}/like-status`)
            .set("Authorization",`Bearer ${accessToken}`)
            .send({
                    "likeStatus": "Dislike" 
            })
            .expect(204)
                
                const commentByIdAfterDislike = await request(app)
            .get(`/comments/${createdCommentForSpecificPost.body.id}`)
            .set('Authorization',`Bearer ${accessToken}`)
            .expect(200)

            expect(commentByIdAfterDislike.body).toEqual({
                "id": createdCommentForSpecificPost.body.id,
                "content": "good comment 1 blablalba",
                "commentatorInfo": {
                  "userId": createdUser.body.id,
                  "userLogin": createdUser.body.login
                },
                "createdAt":expect.any(String),
                "likesInfo": {
                  "likesCount": 0,
                  "dislikesCount": 1,
                  "myStatus": "Dislike"
                }
             })
            })
            
           

        })
    })
    
    


