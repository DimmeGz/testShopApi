import {Schema, model} from 'mongoose'

const schema = new Schema({
    name: {type: String, require: true},
    password: {type: String, required: true},
    phone: {type: String, require: true, unique: true},
    email: {type: String, required: true, unique: true},
})

export const User = model('User', schema)