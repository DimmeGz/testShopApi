import * as dotenv from 'dotenv'
dotenv.config()
import Joi from 'joi'
import fs from 'fs/promises'

import express from 'express'
import mongoose, { ConnectOptions } from 'mongoose'
import {migrate} from './db/migrate'
import bodyParser  from'body-parser'

import {router as productRouter} from './product/product.routes'
import {router as userRouter} from './user/user.routes'
import {router as orderRouter} from './order/order.routes'

const PORT: number = Number(process.env.PORT) || 5000

const app = express()

app.use(bodyParser.json())
app.use(express.json())

app.use('/api/product', productRouter)
app.use('/api/user', userRouter)
app.use('/api/order', orderRouter)

async function start() {
    try {
        const joiSchema = Joi.object({
            S3_BUCKET: Joi.string().required(),
            SECRET_KEY: Joi.string().required(),
            MONGO_URL: Joi.string().required(),
            PORT: Joi.string().required(),
            MIGRATE: Joi.string().optional().allow(''),
            MIGRATION_TYPE: Joi.string().default('up').required()
        })
        const envValues: {[key: string]: any} = {}

        await fs.readFile('.env', 'utf8').then(data => {
            const lines = data.split('\n')
            for (let line of lines) {
                const element = line.split(/=(.*)/s)
                envValues[element[0]] = element[1]
            }
        })

        try {
            await joiSchema.validateAsync(envValues)
        }
        catch (err) {
            throw new Error('.env values error')
        }

        if (!process.env.MONGO_URL) {
            throw new Error('Database URL error')
        }
        await mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        } as ConnectOptions)

        if (!!process.env.MIGRATE && process.env.MIGRATION_TYPE) {
            await migrate(process.env.MONGO_URL, process.env.MIGRATION_TYPE)
        }
        app.listen(PORT, () => {
            console.log(`Server has been started on port ${PORT}...`)
        })
    } catch (e) {
        if (e instanceof Error) {
            console.log('Server Error', e.message)
            process.exit(1)
        }
        process.exit(1)
    }
}

start()