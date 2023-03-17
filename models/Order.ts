import {Schema, model, Types} from 'mongoose'
import {Product} from "./Product.ts"

const schema = new Schema({
    user: {type: Types.ObjectId, ref: 'User'},
    product: {type: Types.ObjectId, ref: 'Product'},
    qty: {type: Number, default: 1},
    sum: {type: Number}
})

export const Order = model('Order', schema)