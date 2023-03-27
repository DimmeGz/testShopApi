import request from 'supertest'
import app from '../app'
import {testAdmin4, testUser4} from './mockData/mockUser'
import {User} from '../user/user.model'
import {testProduct4} from './mockData/mockProduct'
import jwt from 'jsonwebtoken'
import {Product} from '../catalog/product.model'

describe('Category test', () => {
    let admin4: any
    let adminToken4: any
    let user4: any
    let userToken4: any
    beforeAll(async () => {
        admin4 = await User.create(testAdmin4)
        user4 = await User.create(testUser4)
        const JWTKey = process.env.JWT_SECRET
        const adminBody = { email: admin4.email }
        const userBody = { email: user4.email }
        adminToken4 = jwt.sign({ user: adminBody }, JWTKey!)
        userToken4 = jwt.sign({ user: userBody }, JWTKey!)
    })

    it('categories test', async () => {
        const response = await request(app)
            .get("/api/category/")
        expect(response.statusCode).toBe(200)

        const response1 = await request(app)
            .post("/api/category/")
            .send({name: "test_category", description: "test_category_description"})
        expect(response1.statusCode).toBe(401)

        const response2 = await request(app)
            .post("/api/category/")
            .send({name: "test_category", description: "test_category_description"})
            .set('Authorization', `Bearer ${adminToken4}`)
        expect(response2.statusCode).toBe(201)

        const categoryId = response2.body.id

        const response2_exist = await request(app)
            .post("/api/category/")
            .send({name: "test_category", description: "test_category_description"})
            .set('Authorization', `Bearer ${adminToken4}`)
        expect(response2_exist.statusCode).toBe(400)

        const response2_user = await request(app)
            .post("/api/category/")
            .send({name: "test_category", description: "test_category_description"})
            .set('Authorization', `Bearer ${userToken4}`)
        expect(response2_user.statusCode).toBe(403)

        const response3 = await request(app)
            .get("/api/category/" + categoryId)
        expect(response3.statusCode).toBe(200)

        const response4 = await request(app)
            .patch("/api/category/" + categoryId)
            .send({name: "test_category_change", description: "test_category_description"})
        expect(response4.statusCode).toBe(401)

        const response5 = await request(app)
            .patch("/api/category/" + categoryId)
            .send({name: "test_category_change", description: "test_category_description"})
            .set('Authorization', `Bearer ${adminToken4}`)
        expect(response5.statusCode).toBe(200)

        const response5_user = await request(app)
            .patch("/api/category/" + categoryId)
            .send({name: "test_category_change", description: "test_category_description"})
            .set('Authorization', `Bearer ${userToken4}`)
        expect(response5_user.statusCode).toBe(403)

        const response6 = await request(app)
            .delete("/api/category/ + categoryId")
        expect(response6.statusCode).toBe(401)

        const response6_user = await request(app)
            .delete("/api/category/" + categoryId)
            .set('Authorization', `Bearer ${userToken4}`)
        expect(response6_user.statusCode).toBe(403)

        const product4 = await Product.create(testProduct4)
        product4.CategoryId = categoryId
        await product4.save()

        const response7 = await request(app)
            .delete("/api/category/" + categoryId)
            .set('Authorization', `Bearer ${adminToken4}`)
        expect(response7.statusCode).toBe(409)

        await product4.destroy()

        const response8 = await request(app)
            .delete("/api/category/" + categoryId)
            .set('Authorization', `Bearer ${adminToken4}`)
        expect(response8.statusCode).toBe(200)

        const response9 = await request(app)
            .get("/api/category/" + Number.MAX_SAFE_INTEGER)
        expect(response9.statusCode).toBe(404)

        const response10 = await request(app)
            .patch("/api/category/" + Number.MAX_SAFE_INTEGER)
            .send({name: "test_category_change", description: "test_category_description"})
            .set('Authorization', `Bearer ${adminToken4}`)
        expect(response10.statusCode).toBe(404)

        const response11 = await request(app)
            .delete("/api/category/" + Number.MAX_SAFE_INTEGER)
            .set('Authorization', `Bearer ${adminToken4}`)
        expect(response11.statusCode).toBe(404)
    })


    afterAll(async () => {
        await admin4.destroy()
        await user4.destroy()
    })
})