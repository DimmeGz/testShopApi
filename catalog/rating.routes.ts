import  {Request, Response, Router} from 'express'
import {Rating} from './rating.model'
import {Product} from './product.model'
import passport from '../middleware/passport'
import jwt from 'jsonwebtoken'
import _ from 'lodash'
import {where} from 'sequelize';

export const router = Router()

async function getRatingCheckEditable(req: Request, res: Response) {
    try {
        const ratingObj = await Rating.findByPk(req.params.id)
        if (!ratingObj) {
            res.status(404)
            throw new Error('Rating doesn\'t exists')
        }
        if (!_.isEqual(ratingObj.UserId, req.user?.id) && req.user?.role !== 'admin') {
            res.status(403)
            throw new Error('Forbidden')
        }
        return ratingObj
    } catch (e: any) {
        throw e
    }
}

router.get('/', async (req, res) => {
    const ratings = await Rating.findAll()
    res.status(200).json(ratings)
})

router.get('/:id', async (req, res) => {
    try {
        const ratingObj = await Rating.findByPk(req.params.id)
        if (!ratingObj) {
            res.status(404).json({message: 'Rating does not exist'})
            return
        }
        res.status(200).json(ratingObj)
    } catch (e: any) {
        res.status(404).json(e.message)
    }
})

router.post('/', passport.authenticate('jwt', {session: false}),
    async (req, res) => {
        try {
            const UserId = req.user!.id
            const {rating, ProductId} = req.body

            if (await Rating.findOne({where: {UserId, ProductId}})) {
                return res.status(400).json({message: 'Rating exists'})
            }

            const ratingObj = await Rating.create({rating, UserId, ProductId})

            const product = await Product.findByPk(ProductId)
            if (product?.rating) {
                const allRatings = await Rating.findAll({where: {ProductId}})
                const sumRating = allRatings.reduce((acc, obj) => { return acc + obj.rating }, 0)
                product.rating = sumRating / allRatings.length
            } else {
                product!.rating = rating
            }
            await product!.save()

            res.status(201).json(ratingObj)
        } catch (e: any) {
            res.status(404).json(e.message)
        }
    })

router.patch('/:id', passport.authenticate('jwt', {session: false}),
    async (req, res) => {
        try {
            const ratingObj = await getRatingCheckEditable(req, res)
            const {rating} = req.body
            const product = await Product.findByPk(ratingObj.ProductId)
            const allRatings = await Rating.findAll({where: {ProductId: ratingObj.ProductId}})
            let sumRating = allRatings.reduce((acc, obj) => { return acc + obj.rating }, 0)
            sumRating = sumRating - ratingObj.rating + rating

            product!.rating = sumRating / allRatings.length
            await product!.save()

            ratingObj.set(req.body)
            await ratingObj.save()
            res.status(200).json(ratingObj)
        } catch (e: any) {
            if (!res.status) {
                res.status(500)
            }
            res.json(e.message)
        }
    })

router.delete('/:id', passport.authenticate('jwt', {session: false}),
    async (req, res) => {
        try {
            const ratingObj = await getRatingCheckEditable(req, res)
            const product = await Product.findByPk(ratingObj.ProductId)
            const allRatings = await Rating.findAll({where: {ProductId: ratingObj.ProductId}})
            let sumRating = allRatings.reduce((acc, obj) => { return acc + obj.rating }, 0) - ratingObj.rating
            await ratingObj.destroy()
            product!.rating = sumRating / (allRatings.length - 1)
            await product!.save()

            res.status(200).json({deleted: ratingObj.id})
        } catch (e: any) {
            if (!res.status) {
                res.status(500)
            }
            res.json(e.message)
        }
    })