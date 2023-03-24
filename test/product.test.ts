import request from 'supertest';
import app from '../app';
import {User} from '../user/user.model';
import {adminUser, testUser} from './mockData/mockUser';
import jwt from 'jsonwebtoken';
import {productPatchName, productPostBody} from './mockData/mockProduct';
import {Product} from '../catalog/product.model';

describe('for unauthorized', () => {
    let user1: any
    let userToken1: any
    beforeAll(async () => {
        user1 = await User.create(testUser)
        const JWTKey = process.env.JWT_SECRET
        const body = { email: user1.email }
        userToken1 = jwt.sign({ user: body }, JWTKey!)
    })

    it('unauthorized test', async () => {
        const response = await request(app)
            .get("/api/product/")
        expect(response.statusCode).toBe(200)

        const response1 = await request(app)
            .post("/api/product/")
            .send(productPostBody)
        expect(response1.statusCode).toBe(401)

        const response2 = await request(app)
            .post("/api/product/")
            .send(productPostBody)
            .set('Authorization', `Bearer ${userToken1}`)
        expect(response2.statusCode).toBe(403)

        const randomProduct = await Product.findOne()
        const response3 = await request(app)
            .patch("/api/product/" + randomProduct!.id)
            .send(productPatchName)
            .set('Authorization', `Bearer ${userToken1}`)
        expect(response3.statusCode).toBe(403)

        const response4 = await request(app)
            .delete("/api/product/" + randomProduct!.id)
            .set('Authorization', `Bearer ${userToken1}`)
        expect(response3.statusCode).toBe(403)
    })

    afterAll(async () => {
        await user1.destroy()
    })
})

describe('for admin', () => {
    let admin: any
    let adminToken: any
    beforeAll(async () => {
        admin = await User.create(adminUser)
        const JWTKey = process.env.JWT_SECRET
        const body = { email: admin.email }
        adminToken = jwt.sign({ user: body }, JWTKey!)
    })

    it('admin test ', async () => {
        const response = await request(app)
            .post("/api/product/")
            .send(productPostBody)
            .set('Authorization', `Bearer ${adminToken}`)
        expect(response.statusCode).toBe(201)
        expect(response.body.name).toBe(productPostBody.name)
        const productId = response.body.id

        const response1 = await request(app)
            .post("/api/product/")
            .send(productPostBody)
            .set('Authorization', `Bearer ${adminToken}`)
        expect(response1.statusCode).toBe(400)

        const response2 = await request(app)
            .get("/api/product/" + productId)
        expect(response2.statusCode).toBe(200)
        expect(response2.body.id).toBe(productId)

        const response2Admin = await request(app)
            .get("/api/product/" + productId)
            .set('Authorization', `Bearer ${adminToken}`)
        expect(response2Admin.statusCode).toBe(200)
        expect(response2Admin.body.totalSales).toBe(0)

        const response3 = await request(app)
            .get("/api/product/" + Number.MAX_SAFE_INTEGER)
        expect(response3.statusCode).toBe(404)

        const response4 = await request(app)
            .patch("/api/product/" + productId)
            .send(productPatchName)
            .set('Authorization', `Bearer ${adminToken}`)
        expect(response4.statusCode).toBe(200)
        expect(response4.body.name).toBe(productPatchName.name)

        const response5 = await request(app)
            .patch("/api/product/" + Number.MAX_SAFE_INTEGER)
            .send(productPatchName)
            .set('Authorization', `Bearer ${adminToken}`)
        expect(response5.statusCode).toBe(404)

        const response6 = await request(app)
            .patch("/api/product/" + productId)
            .send({"price": "wrong"})
            .set('Authorization', `Bearer ${adminToken}`)
        expect(response6.statusCode).toBe(400)

        const response7 = await request(app)
            .delete("/api/product/" + Number.MAX_SAFE_INTEGER)
            .set('Authorization', `Bearer ${adminToken}`)
        expect(response7.statusCode).toBe(404)

        const response9 = await request(app)
            .delete("/api/product/" + productId)
            .set('Authorization', `Bearer ${adminToken}`)
        expect(response9.statusCode).toBe(200)
        expect(response9.body.deleted).toBe(productId)
    })


    afterAll(async () => {
        await admin.destroy()
    })
})