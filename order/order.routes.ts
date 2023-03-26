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
            res.status(200).json({page, totalPages, elementsCount, data})
        } else {
            const totalPages = await Order.findAndCountAll({where: {UserId: req.user?.id}})

            const data = await Order.findAll({where: {UserId: req.user?.id}, order: [['id', 'ASC']], offset: skipIndex, limit: elementsCount})
            res.status(200).json({page, totalPages: totalPages.count, elementsCount, data})
        }
    } catch (e) {
        res.status(500).json({message: 'something went wrong'})
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
            let {UserId} = req.body
            if (req.user?.role !== 'admin' || !UserId) {
                UserId = req.user?.id
            }
            const resRows = []

            let sum = 0
            const order = await Order.create({UserId, status, sum})
            for (let row of rows) {
                const newRow = await OrderRow.create({OrderId: order.id, ProductId: row.ProductId, qty: row.qty})
                resRows.push(newRow)
                const product = await Product.findByPk(row.ProductId)
                sum += row.qty * product!.price
            }
            order.sum = sum
            order.save()

            res.status(201).json({order, rows: resRows})
        } catch (e) {
            res.status(400).json('Incorrect data')
        }
    })

router.patch('/:id',
    async (req: Request, res: Response) => {
        try {
            const {status, rows} = req.body
            let {UserId} = req.body
            const order = await Order.findByPk(req.params.id)

            if (!order) {
                res.status(404).json({message: 'Order does not exist'})
                return
            }
            if (!_.isEqual(order.UserId, req.user?.id) && req.user?.role !== 'admin') {
                res.status(403).json({message: 'Forbidden'})
                return
            }
            let sum = order.sum

            let resRows = await OrderRow.findAll({where: {OrderId: order.id}})
            if (rows) {
                // Delete existing orderRows from DB and set sum = 0
                sum = 0
                for (let oldRow of resRows) {
                    await oldRow.destroy()
                }
                resRows = []

                // create new orderRows in DB
                for (let row of rows) {
                    const newRow = await OrderRow.create({OrderId: order.id, ProductId: row.ProductId, qty: row.qty})
                    resRows.push(newRow)
                    const product = await Product.findByPk(row.ProductId)
                    sum += row.qty * product!.price
                }
            }
            if (UserId) {
                if (UserId !== req.user?.id && req.user?.role !== 'admin') {
                    UserId = req.user?.id
                }
            }

            await order.set({UserId, status, sum})
            await order.save()

            res.status(200).json({order, rows: resRows})
        } catch (e: any) {
            res.status(400).json({message: 'Incorrect data'})
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

        res.status(200).json({ deleted: order.id })
    } catch (e: any) {
        res.status(404).json({message: e.message})
    }
})