import * as dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import mongoose, {ConnectOptions} from 'mongoose'
import {migrate} from './db/migrate'
import bodyParser from 'body-parser'

import {router as productRouter} from './product/product.routes'
import {router as userRouter} from './user/user.routes'
import {router as orderRouter} from './order/order.routes'

import {getEnv} from "./utils/env_validation"
import {dataValidation} from './middleware/validators'

const app = express()

app.use(bodyParser.json())
app.use(express.json())
app.use(dataValidation)

app.use('/api/product', productRouter)
app.use('/api/user', userRouter)
app.use('/api/order', orderRouter)

async function start() {
    try {
        const envValues = await getEnv()

        await mongoose.connect(envValues.MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        } as ConnectOptions)

        if (!!envValues.MIGRATE && envValues.MIGRATION_TYPE) {
            await migrate(envValues.MONGO_URL, envValues.MIGRATION_TYPE)
        }
        const PORT: number = Number(envValues.PORT) || 5000
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