import request from 'supertest';
import app from '../app';
import {User} from '../user/user.model';
import {testUser2, testAdmin2} from './mockData/mockUser';
import jwt from 'jsonwebtoken';
import {testProduct} from './mockData/mockProduct';
import {Product} from '../catalog/product.model';
import {Order} from "../order/order.models";

describe('order routs ', () => {
    let user2: any
    let admin2: any
    let product2: any
    let userToken2: any
    let adminToken2: any
    beforeAll(async () => {
        user2 = await User.create(testUser2)
        admin2 = await User.create(testAdmin2)
        product2 = await Product.create(testProduct)
        const JWTKey = process.env.JWT_SECRET
        const body = { email: user2.email }
        const body2 = { email: admin2.email }
        userToken2 = jwt.sign({ user: body }, JWTKey!)
        adminToken2 = jwt.sign({ user: body2 }, JWTKey!)
    })

    it('order test', async () => {
        const response = await request(app)
            .get("/api/order/")
        expect(response.statusCode).toBe(401)

        const randomOrder = await Order.findOne()
        const response1 = await request(app)
            .get("/api/order/" + randomOrder!.id)
            .set('Authorization', `Bearer ${userToken2}`)
        expect(response1.statusCode).toBe(404)

        const response2 = await request(app)
            .get("/api/order/")
            .set('Authorization', `Bearer ${userToken2}`)
        expect(response2.statusCode).toBe(200)

        const response3 = await request(app)
            .get("/api/order/")
            .set('Authorization', `Bearer ${adminToken2}`)
        expect(response3.statusCode).toBe(200)

        const testOrderBody = {
            "UserId": user2.id,
            "status": "placed",
            "rows": [{
                "ProductId": product2.id,
                "qty": 3
            }]
        }

        const testOrderBody2 = Object.assign({}, testOrderBody)
        testOrderBody2.UserId = admin2.id

        const response4 = await request(app)
            .post("/api/order/")
            .send(testOrderBody)
            .set('Authorization', `Bearer ${userToken2}`)
        expect(response4.statusCode).toBe(201)

        const orderId = response4.body.order.id

        const response5 = await request(app)
            .get("/api/order/" + orderId)
        expect(response5.statusCode).toBe(401)

        const response6 = await request(app)
            .get("/api/order/" + orderId)
            .set('Authorization', `Bearer ${userToken2}`)
        expect(response6.statusCode).toBe(200)

        const response7 = await request(app)
            .patch("/api/order/" + orderId)
            .send({"status": "cancelled"})
        expect(response7.statusCode).toBe(401)

        const response8 = await request(app)
            .patch("/api/order/" + orderId)
            .send({"status": "cancelled"})
            .set('Authorization', `Bearer ${userToken2}`)
        expect(response8.statusCode).toBe(200)

        const response9 = await request(app)
            .patch("/api/order/" + Number.MAX_SAFE_INTEGER)
            .send({"status": "cancelled"})
            .set('Authorization', `Bearer ${userToken2}`)
        expect(response9.statusCode).toBe(404)

        const response10 = await request(app)
            .patch("/api/order/" + randomOrder!.id)
            .send({"status": "cancelled"})
            .set('Authorization', `Bearer ${userToken2}`)
        expect(response10.statusCode).toBe(403)

        const response11 = await request(app)
            .delete("/api/order/" + orderId)
        expect(response11.statusCode).toBe(401)

        const response12 = await request(app)
            .delete("/api/order/" + orderId)
            .set('Authorization', `Bearer ${userToken2}`)
        expect(response12.statusCode).toBe(200)

        const response13 = await request(app)
            .get("/api/order/" + Number.MAX_SAFE_INTEGER)
            .set('Authorization', `Bearer ${userToken2}`)
        expect(response13.statusCode).toBe(404)
    })

    afterAll(async () => {
        await user2.destroy()
        await admin2.destroy()
        await product2.destroy()
    })
})