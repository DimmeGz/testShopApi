import {Model, Schema, model} from 'mongoose'
import bcrypt from "bcryptjs"

interface IUser {
    _id: string
    name: string
    password: string
    phone: string
    email: string
    role: string
}

declare global {
    namespace Express {
        interface User extends IUser {}
    }
}

interface IUserMethods {
    isValidPassword(password: string): boolean
}

type UserModel = Model<IUser, {}, IUserMethods>

const schema = new Schema({
    name: {type: String, require: true},
    password: {type: String, required: true},
    phone: {type: String, require: true, unique: true},
    email: {type: String, required: true, unique: true},
    role: {type: String, required: true, enum: ['admin', 'user']}
})

schema.pre(
    'save',
    async function(next) {
        this.password = await bcrypt.hash(this.password, 12)
        next()
    }
)

schema.method('isValidPassword', async function isValidPassword(password: string) {
    return await bcrypt.compare(password, this.password)
})

export const User = model<IUser, UserModel>('User', schema)