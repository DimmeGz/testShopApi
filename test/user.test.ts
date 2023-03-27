import request from 'supertest'
import app from '../app'
import {userPatchPhone, userPostBody, incorrectUserPostBody, adminUser} from './mockData/mockUser'
import {User} from '../user/user.model'
import jwt from 'jsonwebtoken'

describe("Test the user routes", () => {
    describe('get user list', () => {
        it('for unauthorized', async () => {
            const response = await request(app)
                .get("/api/user/")
            expect(response.statusCode).toBe(401)
        })
    })

    describe('create, and patch new user', () => {
        it('create, patch and delete new user', async () => {
            const admin = await User.create(adminUser)

            const response = await request(app)
                .post("/api/user/")
                .send(userPostBody)
            expect(response.statusCode).toBe(200)
            const userToken = response.body.token
            const userId = response.body.user.id

            const response1 = await request(app)
                .post("/api/user/")
                .send(userPostBody)
            expect(response1.statusCode).toBe(400)

            const response2 = await request(app)
                .get("/api/user/")
                .set('Authorization', `Bearer ${userToken}`)
            expect(response2.statusCode).toBe(403)

            const response3 = await request(app)
                .get("/api/user/" + userId)
                .set('Authorization', `Bearer ${userToken}`)
            expect(response3.statusCode).toBe(200)

            const response4 = await request(app)
                .get("/api/user/" + admin.id)
                .set('Authorization', `Bearer ${userToken}`)
            expect(response4.statusCode).toBe(403)

            const response5 = await request(app)
                .patch("/api/user/" + userId)
                .send(userPatchPhone)
                .set('Authorization', `Bearer ${userToken}`)
            expect(response5.statusCode).toBe(200)
            expect(response5.body.phone).toBe(userPatchPhone.phone)

            const user = await User.findByPk(userId)
            user?.destroy()

            await admin.destroy()
        })
    })

    describe('try to create incorrect user', () => {
        it('create user without field', async () => {
            const response = await request(app)
                .post("/api/user/")
                .send(incorrectUserPostBody)
            expect(response.statusCode).toBe(400)
        })
    })

    describe('auth by admin, create, patch and delete new user', () => {
        let admin: any
        let adminToken: any
        beforeAll(async () => {
            admin = await User.create(adminUser)
            const JWTKey = process.env.JWT_SECRET
            const body = { email: admin.email }
            adminToken = jwt.sign({ user: body }, JWTKey!)
        })

        it('get, patch, wrong patch and delete user', async () => {
            userPostBody.role = 'user'
            const user = await User.create(userPostBody)

            const response0 = await request(app)
                .get("/api/user/")
                .set('Authorization', `Bearer ${adminToken}`)
            expect(response0.statusCode).toBe(200)

            const response1 = await request(app)
                .get("/api/user/" + Number.MAX_SAFE_INTEGER)
                .set('Authorization', `Bearer ${adminToken}`)
            expect(response1.statusCode).toBe(404)

            const response2 = await request(app)
                .patch("/api/user/" + Number.MAX_SAFE_INTEGER)
                .send(userPatchPhone)
                .set('Authorization', `Bearer ${adminToken}`)
            expect(response2.statusCode).toBe(404)

            const response3 = await request(app)
                .patch("/api/user/" + user.id)
                .send(userPatchPhone)
                .set('Authorization', `Bearer ${adminToken}`)
            expect(response3.statusCode).toBe(200)
            expect(response3.body.phone).toBe(userPatchPhone.phone)

            const response4 = await request(app)
                .patch("/api/user/" + user.id)
                .send({"phone": "wrong"})
                .set('Authorization', `Bearer ${adminToken}`)
            expect(response4.statusCode).toBe(400)

            const response5 = await request(app)
                .delete("/api/user/" + user.id)
                .set('Authorization', `Bearer ${adminToken}`)
            expect(response5.statusCode).toBe(200)
            expect(response5.body.deleted).toBe(user.id)

            const response6 = await request(app)
                .delete("/api/user/" + Number.MAX_SAFE_INTEGER)
                .set('Authorization', `Bearer ${adminToken}`)
            expect(response6.statusCode).toBe(404)

            await user.destroy()
        })

        afterAll(async () => {
            await admin.destroy()
        })
    })
})