import * as dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import bodyParser from 'body-parser'

import {router as productRouter} from './catalog/product.routes'
import {router as categoryRouter} from './catalog/category.routes'
import {router as commentRouter} from './catalog/comments.routes'
import {router as imageRouter} from './catalog/image.routes'
import {router as userRouter} from './user/user.routes'
import {router as orderRouter} from './order/order.routes'
import {router as authRouter} from './auth/auth.routes'
import {router as ratingRouter} from './catalog/rating.routes'

import {dataValidation} from './middleware/validators'
import passport from "./middleware/passport"

const app = express()

app.use(bodyParser.json())
app.use(express.json())
app.use(dataValidation)

app.use('/api/product', productRouter)
app.use('/api/comment', commentRouter)
app.use('/api/rating', ratingRouter)
app.use('/api/image', imageRouter)
app.use('/api/category', categoryRouter)
app.use('/api/user', userRouter)
app.use('/api/auth', authRouter)
app.use('/api/order', passport.authenticate('jwt', { session: false }), orderRouter)


export default app