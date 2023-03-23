import {Request, Response, Router} from 'express'
import {Order, OrderRow} from './order.models'
import {Product} from '../catalog/product.model'
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
        const rows = await OrderRow.findAll({where: {OrderId: order.id}})
        res.status(200).json({order, rows})
    } catch (e: any) {
        res.status(404).json(e.message)
    }
})

router.post('/',
    async (req: Request, res: Response) => {
        try {
            const {status, rows} = req.body
            let {user} = req.body
            if (req.user?.role !== 'admin' || !user) {
                user = req.user?.id
            }

            let sum = 0
            const order = await Order.create({UserId: user, status, sum})
            for (let row of rows) {
                await OrderRow.create({OrderId: order.id, ProductId: row.product, qty: row.qty})
                const product = await Product.findByPk(row.product)
                sum += row.qty * product!.price
            }
            order.sum = sum
            order.save()

            res.status(201).json(`Order №${order.id} added`)
        } catch (e) {
            res.status(404).json('Bad request')
        }
    })

router.patch('/:id',
    async (req: Request, res: Response) => {
        try {
            const {status, rows} = req.body
            let {user} = req.body
            const order = await Order.findByPk(req.params.id)

            if (!order) {
                res.status(404).json({message: 'Order does not exist'})
                return
            }
            if (!_.isEqual(order.UserId, req.user?.id) && req.user?.role !== 'admin') {
                res.status(403).json({message: 'You don\'t have permission to access this resource'})
                return
            }
            let sum = order.sum
            if (rows) {
                // Delete existing orderRows from DB and set sum = 0
                sum = 0
                const oldRows = await OrderRow.findAll({where: {OrderId: order.id}})
                for (let oldRow of oldRows) {
                    await oldRow.destroy()
                }

                // create new orderRows in DB
                for (let row of rows) {
                    await OrderRow.create({OrderId: order.id, ProductId: row.product, qty: row.qty})
                    const product = await Product.findByPk(row.product)
                    sum += row.qty * product!.price
                }
            }
            if (user) {
                if (user !== req.user?.id && req.user?.role !== 'admin') {
                    user = req.user?.id
                }
            }

            await order.set({UserId: user, status: status, sum: sum})
            await order.save()

            res.status(200).json(`Order №${order.id} updated`)
        } catch (e: any) {
            console.log(e.message)
            res.status(404).json({message: 'Bad request'})
        }
    })

router.delete('/:id', async (req, res) => {
    try {
        const order = await getOrder(req, res)

        const rows = await OrderRow.findAll({where: {OrderId: order.id}})
        for (let row of rows) {
            await row.destroy()
        }

        await order.destroy()

        res.status(200).json(`Order №${order.id} deleted`)
    } catch (e: any) {
        res.status(404).json({message: e.message})
    }
})