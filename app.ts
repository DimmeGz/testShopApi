import * as dotenv from 'dotenv'
dotenv.config()

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
        if (!process.env.mongoURL) {
            throw new Error('Database URL error')
        }
        await mongoose.connect(process.env.mongoURL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        } as ConnectOptions)

        if (!!process.env.migrate && process.env.migrationType) {
            await migrate(process.env.mongoURL, process.env.migrationType)
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