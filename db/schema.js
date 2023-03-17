import {Schema, model} from 'mongoose'

const schema = new Schema({
    name: {type: String},
    date: {type: Date}
})

export const Migration = model('Migration', schema)