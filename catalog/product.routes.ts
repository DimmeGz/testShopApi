import express, {Router} from 'express'
import passport from "../middleware/passport"

import {Product} from './product.model'
import {Rating} from './rating.model'
import {Image} from './image.model'
import {OrderRow} from '../order/order.models'
import {Comment} from './comments.model'
import {getPaginationParameters} from "../utils/functions"

export const router = Router()

router.get('/', async (req, res) => {
    const {page, elementsCount, skipIndex} = getPaginationParameters(req)

    const totalPages = Math.ceil(await Product.count() / elementsCount)

    try {
        const data = await Product.findAll({order: [['id', 'ASC']], offset: skipIndex, limit: elementsCount})
        res.status(200).json({page, totalPages, elementsCount, data})
    } catch (e) {
        res.status(500).json({message: 'something went wrong'})
    }
})

router.get('/:id',
    async (req, res) => {
        try {
            const product = await Product.findByPk(req.params.id)
            if (!product) {
                res.status(404).json({message: 'Product does not exist'})
                return
            }
            res.status(200).json(product)
        } catch (e) {
            res.status(404).json(e)
        }
    })

router.get('/:id/get_comments',
    async (req, res) => {
        try {
            const product = await Product.findByPk(req.params.id)
            if (!product) {
                res.status(404).json({message: 'Product does not exist'})
                return
            }
            const comments = await Comment.findAll({where: {ProductId: req.params.id}})
            res.status(200).json(comments)
        } catch (e) {
            res.status(404).json(e)
        }
    })

router.get('/:id/get_statistics', passport.authenticate('jwt', {session: false}),
    async (req, res) => {
        try {
            if (req.user?.role === 'admin') {
                const product = await Product.findByPk(req.params.id)
                if (!product) {
                    res.status(404).json({message: 'Product does not exist'})
                    return
                }
                const orderRows = await OrderRow.findAll({where: {ProductId: product?.id}})
                const totalSales = orderRows.reduce(function (acc, obj) {
                    return acc + obj.qty
                }, 0)
                res.status(200).json({product, totalSales})
            } else {
                res.status(403).json({message: 'Forbidden'})
            }
        } catch (e) {
            res.status(404).json(e)
        }
    })

router.post('/', passport.authenticate('jwt', {session: false}),
    async (req: express.Request, res: express.Response) => {
        try {
            if (req.user?.role === 'admin') {
                const existingProduct = await Product.findOne({where: {name: req.body.name}})
                if (existingProduct) {
                    return res.status(400).json({message: 'Such product exists'})
                }

                const product = await Product.create({
                    name: req.body.name,
                    description: req.body.description,
                    price: req.body.price,
                    isAvailable: req.body.isAvailable,
                    CategoryId: req.body.CategoryId,
                    buyersCount: 0,
                    rating: 0,
                    count: req.body.count
                })

                res.status(201).json(product)
            } else {
                res.status(403).json({message: 'You don\'t have permission to access this resource'})
            }
        } catch (e) {
            res.status(400).json({message: 'Incorrect data'})
        }
    })

router.patch('/:id', passport.authenticate('jwt', {session: false}),
    async (req: express.Request, res: express.Response) => {
        try {
            if (req.user?.role === 'admin') {
                const product = await Product.findByPk(req.params.id)

                if (!product) {
                    res.status(404).json({message: 'Product does not exist'})
                    return
                }
                product.set(req.body)
                await product.save()
                res.status(200).json(product)
            } else {
                res.status(403).json({message: 'You don\'t have permission to access this resource'})
            }
        } catch (e) {
            res.status(404).json({message: 'Bad request'})
        }
    })

router.delete('/:id', passport.authenticate('jwt', {session: false}),
    async (req, res) => {
        try {
            if (req.user?.role === 'admin') {
                const product = await Product.findByPk(req.params.id)
                if (!product) {
                    res.status(404).json({message: 'Product does not exist'})
                    return
                }
                await product.destroy()

                async function deleteRelated(objList: any) {
                    for (let obj of objList) {
                        await obj.destroy()
                    }
                }

                const comments = await Comment.findAll({where: {ProductId: product.id}})
                await deleteRelated(comments)

                const ratings = await Rating.findAll({where: {ProductId: product.id}})
                await deleteRelated(ratings)

                const images = await Image.findAll({where: {ProductId: product.id}})
                await deleteRelated(images)

                res.status(200).json({deleted: product.id})
            } else {
                res.status(403).json({message: 'You don\'t have permission to access this resource'})
            }
        } catch (e) {
            res.status(404).json({message: 'Bad request'})
        }
    })