import {User} from '../user/user.model';
import {testUser3} from './mockData/mockUser';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import app from '../app';
import bcrypt from 'bcryptjs';

describe('Authentication test', () => {
    let user3: any
    beforeAll(async () => {
        const hashed_password = await bcrypt.hash(testUser3.password, 12)
        user3 = await User.create({
            name: testUser3.name,
            phone: testUser3.phone,
            email: testUser3.email,
            password: hashed_password,
            role: 'user'
        })
    })

    it('auth test', async () => {
        const response = await request(app)
            .post("/api/auth/")
            .send({authField: testUser3.email, password: testUser3.password})
        expect(response.statusCode).toBe(200)

        const response1 = await request(app)
            .post("/api/auth/")
            .send({authField: "wrong", password: "password"})
        console.log(response1.body)
        expect(response1.statusCode).toBe(400)

        const response2 = await request(app)
            .post("/api/auth/")
            .send({authField: testUser3.email, password: "wrong_password"})
        console.log(response2.body)
        expect(response2.statusCode).toBe(401)
    })


    afterAll(async () => {
        await user3.destroy()
    })
})