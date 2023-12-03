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

   

    describe('/blogs', () => {
      beforeAll( async () => {
            await request(app).delete('/testing/all-data')
        })

        it('+ GET blogs', async () => {
            const res_ = await request(app)
                .get(RouterPaths.blogs)
                .expect(200)
            expect(res_.body.items.length).toBe(0)
        })
     })
})
        

    
     
        
   

