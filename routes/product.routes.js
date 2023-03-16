import {Router} from 'express'
import {validationResult} from 'express-validator'

import {Product} from '../models/Product.js'
import {productValidators} from "../utils/validators.js"

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
        res.json(product)
    } catch (e) {
        res.status(500).json({message: 'something went wrong'})
    }
})

router.post('/', [productValidators],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({errors: errors.array()});
            }

            const product = new Product({...req.body})
            await product.save()

            res.status(201).json('Product added')

        } catch (e) {
            res.status(400).json({message: 'Incorrect data'})
        }
    })

router.patch('/:id', [productValidators],
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
            const product = await Product.findById(req.params.id)

            Object.assign(product, params)
            product.save()

            res.status(200).json('Product updated')
        } catch (e) {
            res.status(404).json({message: 'Bad request'})
        }
    })

router.delete('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
        product.deleteOne()

        res.status(200).json('Product deleted')
    } catch (e) {
        res.status(404).json({message: 'Bad request'})
    }
})