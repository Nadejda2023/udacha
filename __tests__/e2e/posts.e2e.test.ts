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

    describe('testing of creation posts with likestatus', () => {
        
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
                    "name": "nameBlogBlaBlaBla",
                    "description": "description",
                    "websiteUrl": "https://it-incubator.io/"
                  
            })
            .expect(201)

            const createdPost = await request(app)
            .post('/posts')
            .set("Authorization",`Basic ${adminCredentionalsInBase64}`)
            .send({
                "title": "title",
                "shortDescription": "stringDescription",
                "content": "content",
                "blogId": createdBlog.body.id
                  
            })
            .expect(201)

            
                

    
            const foundedPostById = await request(app)
            .get(`/posts/${createdPost.body.id}`)
            .set('Authorization',`Bearer ${accessToken}`)
            .expect(200)

            expect(foundedPostById.body).toEqual({
                "id": createdPost.body.id,
                "title": "title",
                "shortDescription": "stringDescription",
                "content": "content",
                "blogId": createdBlog.body.id,
                "blogName": createdBlog.body.blogName,
                "createdAt": expect.any(String),
                "extendedLikesInfo": {
                  "likesCount": 0,
                  "dislikesCount": 0,
                  "myStatus": "None",
                  "newestLikes": [
                    {
                      "addedAt": expect.any(String),
                      "userId": createdUser.body.id,
                      "login": createdUser.body.login
                    }
                  ]
                }
              })

              const updatePostsLikeStatus = await request(app)
            .put(`/posts/${createdPost.body.id}/like-status`)
            .set("Authorization",`Bearer ${accessToken}`)
            .send({
                    "likeStatus": "Like" 
            })
            .expect(204)

            const postByIdAfterLike = await request(app)
            .get(`/posts/${createdPost.body.id}`)
            .set('Authorization',`Bearer ${accessToken}`)
            .expect(200)

            expect(postByIdAfterLike.body).toEqual({
                "id": createdPost.body.id,
                "title": "title",
                "shortDescription": "stringDescription",
                "content": "content",
                "extendedLikesInfo": {
                    "likesCount": 1,
                    "dislikesCount": 0,
                    "myStatus": "Like",
                    "newestLikes": [
                      {
                        "addedAt": expect.any(String),
                        "userId": createdUser.body.id,
                        "login": createdUser.body.login
                      }
                    ]
                  }
            })
            const updatePostDislikeStatus = await request(app)
            .put(`/posts/${createdPost.body.id}/like-status`)
            .set("Authorization",`Bearer ${accessToken}`)
            .send({
                    "likeStatus": "Dislike" 
            })
            .expect(204)
                
                const postByIdAfterDislike = await request(app)
            .get(`/comments/${createdPost.body.id}`)
            .set('Authorization',`Bearer ${accessToken}`)
            .expect(200)

            expect(postByIdAfterDislike.body).toEqual({
                "id": createdPost.body.id,
                "title": "title",
                "shortDescription": "stringDescription",
                "content": "content",
                "extendedLikesInfo": {
                    "likesCount": 0,
                    "dislikesCount": 1,
                    "myStatus": "Dislike",
                    "newestLikes": [
                      {
                        "addedAt": expect.any(String),
                        "userId": createdUser.body.id,
                        "login": createdUser.body.login
                      }
                    ]
                }
             })
            })
            
           

        })
    })
    
    


