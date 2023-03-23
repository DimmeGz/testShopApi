import {Request, Response, Router} from 'express'
import {Order} from './order.models'
import {Product} from '../product/product.model'
import _ from "lodash"
import {getPaginationParameters} from "../utils/functions"

export const router = Router()

async function getOrder (req: Request, res: Response) {
    const order = await Order.findByPk(req.params.id)
    if (!order) {
        throw new Error('Order does not exist')
    }
    if (!_.isEqual(order.UserId, req.user?.id) && req.user?.role !== 'admin') {
        throw new Error('You don\'t have permission to access this resource')
    }
    return order
}

router.get('/',
    async (req: Request, res: Response) => {
        // await Order.sync({ force: false })
        // await Product.sync({ force: false })
    try {
        const {page, elementsCount, skipIndex} = getPaginationParameters(req)
        if (req.user?.role === 'admin') {
            const totalPages = Math.ceil(await Order.count() / elementsCount)

            const data = await Order.findAll({order: [['id', 'ASC']], offset: skipIndex, limit: elementsCount})
            res.json({page, totalPages, elementsCount, data})
        } else {
            const totalPages = await Order.findAndCountAll({where: {UserId: req.user?.id}})

            const data = await Order.findAll({where: {UserId: req.user?.id}, order: [['id', 'ASC']], offset: skipIndex, limit: elementsCount})
            res.json({page, totalPages: totalPages.count, elementsCount, data})
        }
    } catch (e) {
        res.status(404).json('Bad request')
    }
})

router.get('/:id',
    async (req, res) => {
    try {
        const order = await getOrder(req, res)
        res.status(200).json(order)
    } catch (e: any) {
        res.status(404).json(e.message)
    }
})

router.post('/',
    async (req: Request, res: Response) => {
        try {
            const {product, qty} = req.body
            let {user} = req.body
            const productInstance = await Product.findByPk(product)
            if (req.user?.role !== 'admin' || !user) {
                user = req.user?.id
            }

            if (productInstance?.price) {
                const sum = productInstance.price * qty

                await Order.create({ProductId: product, UserId: user, qty, sum})

                res.status(201).json('Order added')
            } else {
                res.status(404).json({message: 'Product does not exist'})
            }
        } catch (e) {
            res.status(404).json('Bad request')
        }
    })

router.patch('/:id',
    async (req: Request, res: Response) => {
        try {
            const params = req.body
            const order = await Order.findByPk(req.params.id)

            if (!order) {
                res.status(404).json({message: 'Order does not exist'})
                return
            }
            if (!_.isEqual(order.UserId, req.user?.id) && req.user?.role !== 'admin') {
                res.status(403).json({message: 'You don\'t have permission to access this resource'})
                return
            }
            if (params.product || params.qty) {
                let productInstance, qty
                if (params.product) {
                    productInstance = await Product.findByPk(params.product)
                } else {
                    productInstance = await Product.findByPk(order.ProductId)
                }
                if (params.qty) {
                    qty = params.qty
                } else {
                    qty = order.qty
                }
                if (!productInstance || !productInstance.price) {
                    res.status(404).json({message: 'Product in order does not exist'})
                    return
                }
                params.sum = productInstance.price * qty
            }
            if (params.user) {
                if (params.user !== req.user?.id) {
                    params.user = req.user?.id
                }
            }

            await order.set({ProductId: params.product, UserId: params.user, qty: params.qty, sum: params.sum})
            await order.save()

            res.status(200).json('Order updated')
        } catch (e) {
            res.status(404).json({message: 'Bad request'})
        }
    })

router.delete('/:id', async (req, res) => {
    try {
        const order = await getOrder(req, res)
        await order.destroy()

        res.status(200).json('Order deleted')
    } catch (e: any) {
        res.status(404).json({message: e.message})
    }
})