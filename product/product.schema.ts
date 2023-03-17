import {Schema, model} from 'mongoose'

const schema = new Schema({
    name: {type: String, require: true, unique: true},
    description: {type: String},
    image: {type: String},
    price: {type: Number, require: true},
    isAvailable: {type: Boolean, require: true}
})

export const Product = model('Product', schema)