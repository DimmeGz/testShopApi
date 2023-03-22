import express, {Router} from 'express'

import {Product} from './product.schema'
import passport from "../middleware/passport";

export const router = Router()

router.get('/', async (req, res) => {
    try {
        const products = await Product.find()
        res.json(products)
    } catch (e) {
        res.status(500).json({message: 'something went wrong'})
    }
})

router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
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
                const existingProduct = await Product.findOne({name: req.body.name})
                if (existingProduct) {
                    return res.status(400).json({message: 'Such product exists'})
                }

                const product = new Product(req.body)
                await product.save()

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
                const params = req.body
                const product = await Product.findById(req.params.id)

                if (!product) {
                    res.status(404).json({message: 'Product does not exist'})
                    return
                }
                Object.assign(product, params)
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
            const product = await Product.findById(req.params.id)
            if (!product) {
                res.status(404).json({message: 'Product does not exist'})
                return
            }
            await product.deleteOne()
            res.status(200).json('Product deleted')
        } else {
            res.status(403).json({message: 'You don\'t have permission to access this resource'})
        }
    } catch (e) {
        res.status(404).json({message: 'Bad request'})
    }
})