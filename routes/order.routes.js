import {Router} from 'express'
import {validationResult} from "express-validator"
import {Order} from '../models/Order.js'
import {Product} from '../models/Product.js'
import {orderValidators, productValidators} from '../utils/validators.js'


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
        const orders = await Order.findById(res.params.id)
        res.json(orders)
    } catch (e) {
        res.status(404).json('Bad request')
    }
})

router.post('/', [orderValidators],
    async (req, res) => {
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return res.status(400).json({errors: errors.array()})
            }

            const {user, product, qty} = {...req.body}
            const productInstance = await Product.findById(product)
            const sum = productInstance.price * qty

            const order = new Order({user, product, qty, sum})
            await order.save()

            res.status(201).json('Order added')
        } catch (e) {
            res.status(404).json('Bad request')
        }
    })

router.patch('/:id', [orderValidators],
    async (req, res) => {
        try {
            const errors = validationResult(req)
            const params = {...req.body}
            if (!errors.isEmpty()) {
                for (let error of errors.array()) {
                    if (error.param in params) {
                        return res.status(400).json({errors: error})
                    }
                }
            }
            const order = await Order.findById(req.params.id)

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
        order.deleteOne()

        res.status(200).json('Product deleted')
    } catch (e) {
        res.status(404).json({message: 'Bad request'})
    }
})