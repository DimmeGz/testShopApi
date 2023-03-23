import express, {Router} from 'express'
import {Category} from './category.models'
import passport from '../middleware/passport'
import {Product} from './product.model'

export const router = Router()

router.get('/',
    async (req, res) => {
        try {
            const categories = await Category.findAll()
            res.json(categories)
        } catch (e) {
            res.status(500).json({message: 'something went wrong'})
        }
    })

router.get('/:id',
    async (req, res) => {
        try {
            const category = await Category.findByPk(req.params.id)

            if (!category) {
                res.status(404).json({message: 'Category does not exist'})
                return
            }
            const products = await Product.findAll({where: {CategoryId: category.id}})
            res.status(200).json({category, products})
        } catch (e) {
            res.status(404).json(e)
        }
    })

router.post('/', passport.authenticate('jwt', {session: false}),
    async (req, res) => {
        try {
            if (req.user?.role === 'admin') {
                const existingCategory = await Category.findOne({where: {name: req.body.name}})
                if (existingCategory) {
                    return res.status(400).json({message: 'Such category exists'})
                }

                await Category.create(req.body)

                res.status(201).json('Category added')
            } else {
                res.status(403).json({message: 'You don\'t have permission to access this resource'})
            }
        } catch (e) {
            res.status(400).json({message: 'Incorrect data'})
        }
    })


router.patch('/:id',
    passport.authenticate('jwt', {session: false}),
    async (req: express.Request, res: express.Response) => {
        try {
            if (req.user?.role === 'admin') {
                const category = await Category.findByPk(req.params.id)

                if (!category) {
                    res.status(404).json({message: 'Category does not exist'})
                    return
                }
                category.set(req.body)
                await category.save()
                res.status(200).json('Category updated')
            } else {
                res.status(403).json({message: 'You don\'t have permission to access this resource'})
            }
        } catch (e) {
            res.status(404).json({message: 'Bad request'})
        }
    })

router.delete('/:id',
    passport.authenticate('jwt', {session: false}),
    async (req: express.Request, res: express.Response) => {
        try {
            if (req.user?.role === 'admin') {
                const category = await Category.findByPk(req.params.id)
                if (!category) {
                    return res.status(404).json({message: 'Category does not exist'})
                }
                const products = await Product.findAll({where: {CategoryId: category?.id}})
                if (products.length) {
                    return res.status(409).json({message: 'Category can\'t be deleted: products exist'})
                }
                category?.destroy()
                res.status(200).json('Category deleted')
            } else {
                res.status(403).json({message: 'You don\'t have permission to access this resource'})
            }
        } catch (e) {
            res.status(404).json({message: 'Bad request'})
        }
    })