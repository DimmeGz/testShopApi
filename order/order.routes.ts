import express, {Router} from 'express'
import {Order} from './order.schema'
import {Product} from '../product/product.schema'


export const router = Router()

router.get('/', async (req, res) => {
    try {
        const orders = await Order.find()
        res.json(orders)
    } catch (e) {
        res.status(404).json('Bad request')
    }
})

router.get('/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
        if (!order) {
            res.status(404).json({message: 'Order does not exist'})
            return
        }
        res.status(200).json(order)
    } catch (e) {
        res.status(404).json(e)
    }
})

router.post('/',
    async (req: express.Request, res: express.Response) => {
        try {
            const {user, product, qty} = req.body
            const productInstance = await Product.findById(product)
            if (productInstance?.price) {
                const sum = productInstance.price * qty

                const order = new Order({user, product, qty, sum})
                await order.save()

                res.status(201).json('Order added')
            } else {
                res.status(404).json({message: 'Product does not exist'})
            }
        } catch (e) {
            res.status(404).json('Bad request')
        }
    })

router.patch('/:id',
    async (req: express.Request, res: express.Response) => {
        try {
            const params = req.body
            const order = await Order.findById(req.params.id)

            if (!order) {
                res.status(404).json({message: 'Order does not exist'})
                return
            }
            if (params.product || params.qty) {
                let productInstance, qty
                if (params.product) {
                    productInstance = await Product.findById(params.product)
                } else {
                    productInstance = await Product.findById(order.product)
                }
                if (params.qty) {
                    qty = params.qty
                } else {
                    qty = order.qty
                }
                if (!productInstance || ! productInstance.price) {
                    res.status(404).json({message: 'Product in order does not exist'})
                    return
                }
                params.sum = productInstance.price * qty
            }

            Object.assign(order, params)
            await order.save()

            res.status(200).json('Order updated')
        } catch (e) {
            res.status(404).json({message: 'Bad request'})
        }
    })

router.delete('/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
        if (!order) {
            res.status(404).json({message: 'Order does not exist'})
            return
        }
        await order.deleteOne()

        res.status(200).json('Order deleted')
    } catch (e) {
        res.status(404).json({message: 'Bad request'})
    }
})