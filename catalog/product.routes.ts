import express, {Router} from 'express'

import {Product} from './product.model'
import passport from "../middleware/passport";
import {getPaginationParameters} from "../utils/functions"

export const router = Router()

router.get('/', async (req, res) => {
    await Product.sync({ force: false })
    const {page, elementsCount, skipIndex} = getPaginationParameters(req)

    const totalPages = Math.ceil(await Product.count() / elementsCount)
    const data1 = await Product.findAll()

    try {
        const data = await Product.findAll({order: [['id', 'ASC']], offset: skipIndex, limit: elementsCount})
        res.json({page, totalPages, elementsCount, data})
    } catch (e) {
        res.status(500).json({message: 'something went wrong'})
    }
})

router.get('/:id', async (req, res) => {
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

router.post('/', passport.authenticate('jwt', { session: false }),
    async (req: express.Request, res: express.Response) => {
        try {
            if (req.user?.role === 'admin') {
                const existingProduct = await Product.findOne({where: {name: req.body.name}})
                if (existingProduct) {
                    return res.status(400).json({message: 'Such product exists'})
                }

                await Product.create(req.body)

                res.status(201).json('Product added')
            } else {
                res.status(403).json({message: 'You don\'t have permission to access this resource'})
            }
        } catch (e) {
            res.status(400).json({message: 'Incorrect data'})
        }
    })

router.patch('/:id', passport.authenticate('jwt', { session: false }),
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
                res.status(200).json('Product updated')
            } else {
                res.status(403).json({message: 'You don\'t have permission to access this resource'})
            }
        } catch (e) {
            res.status(404).json({message: 'Bad request'})
        }
    })

router.delete('/:id', passport.authenticate('jwt', { session: false }),
    async (req, res) => {
    try {
        if (req.user?.role === 'admin') {
            const product = await Product.findByPk(req.params.id)
            if (!product) {
                res.status(404).json({message: 'Product does not exist'})
                return
            }
            await product.destroy()
            res.status(200).json('Product deleted')
        } else {
            res.status(403).json({message: 'You don\'t have permission to access this resource'})
        }
    } catch (e) {
        res.status(404).json({message: 'Bad request'})
    }
})