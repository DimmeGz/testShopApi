import request from 'supertest'
import app from '../app'
import {testUser5, testAdmin5} from './mockData/mockUser'
import {testProduct5} from './mockData/mockProduct'
import {User} from '../user/user.model'
import {Product} from '../catalog/product.model'
import {Comment} from '../catalog/comments.model'
import jwt from 'jsonwebtoken'

describe("Test comments routes", () => {
    let user5: any
    let admin5: any
    let product5: any
    let userToken5: any
    let adminToken5: any
    beforeAll(async () => {
        user5 = await User.create(testUser5)
        admin5 = await User.create(testAdmin5)
        product5 = await Product.create(testProduct5)
        const JWTKey = process.env.JWT_SECRET
        const body = {email: user5.email}
        const body2 = {email: admin5.email}
        userToken5 = jwt.sign({user: body}, JWTKey!)
        adminToken5 = jwt.sign({user: body2}, JWTKey!)
    })

    it('comments test', async () => {
        const randomComment = await Comment.findOne()

        const responseGet = await request(app)
            .get("/api/comment/")
        expect(responseGet.statusCode).toBe(200)

        const responsePost = await request(app)
            .post("/api/comment/")
            .send({"ProductId": product5.id, "text": "401_comment"})
        expect(responsePost.statusCode).toBe(401)

        const responsePost1 = await request(app)
            .post("/api/comment/")
            .send({"ProductId": product5.id, "text": "201_comment"})
            .set('Authorization', `Bearer ${userToken5}`)
        expect(responsePost1.statusCode).toBe(201)
        const commentId =responsePost1.body.id

        const responseGet1 = await request(app)
            .get("/api/comment/" + commentId)
        expect(responseGet1.statusCode).toBe(200)

        const responseGet2 = await request(app)
            .get("/api/comment/" + Number.MAX_SAFE_INTEGER)
        expect(responseGet2.statusCode).toBe(404)

        const responsePatch = await request(app)
            .patch("/api/comment/" + commentId)
            .send({"text": "updated_comment"})
            .set('Authorization', `Bearer ${userToken5}`)
        expect(responsePatch.statusCode).toBe(200)

        const responsePatch1 = await request(app)
            .patch("/api/comment/" + commentId)
            .send({"text": "updated_comment"})
        expect(responsePatch1.statusCode).toBe(401)

        const responsePatch2 = await request(app)
            .patch("/api/comment/" + randomComment?.id)
            .send({"text": "updated_comment"})
            .set('Authorization', `Bearer ${userToken5}`)
        expect(responsePatch2.statusCode).toBe(403)

        const responsePatch3 = await request(app)
            .patch("/api/comment/" + Number.MAX_SAFE_INTEGER)
            .send({"text": "updated_comment"})
            .set('Authorization', `Bearer ${userToken5}`)
        expect(responsePatch3.statusCode).toBe(404)

        const responseDelete = await request(app)
            .delete("/api/comment/" + commentId)
        expect(responseDelete.statusCode).toBe(401)

        const responseDelete1 = await request(app)
            .delete("/api/comment/" + randomComment?.id)
            .set('Authorization', `Bearer ${userToken5}`)
        expect(responseDelete1.statusCode).toBe(403)

        const responseDelete2 = await request(app)
            .delete("/api/comment/" + commentId)
            .set('Authorization', `Bearer ${userToken5}`)
        expect(responseDelete2.statusCode).toBe(200)
    })


    afterAll(async () => {
        await user5.destroy()
        await admin5.destroy()
    })
})