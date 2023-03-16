import express from 'express'
import config from 'config'
import mongoose from 'mongoose'

import {router as productRouter} from './routes/product.routes.js'
import {router as userRouter} from './routes/user.routes.js'
import {router as orderRouter} from './routes/order.routes.js'

const PORT = config.get('port') || 5000

const app = express()

app.use(express.json({extended: true}))

app.use('/api/product', productRouter)
app.use('/api/user', userRouter)
app.use('/api/order', orderRouter)

async function start() {
    try {
        await mongoose.connect(config.get('mongoUri'), {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })

        app.listen(PORT, () => {
            console.log(`Server has been started on port ${PORT}...`)
        })
    } catch (e) {
        console.log('Server Error', e.message)
        process.exit(1)
    }
}

start()