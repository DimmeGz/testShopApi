import express, {Request, Response, Router} from 'express'
import {Comment} from './comments.model'
import passport from '../middleware/passport'
import jwt from 'jsonwebtoken'
import {Product} from './product.model'
import _ from 'lodash'

export const router = Router()

async function getProduct (req: Request) {
    const product = await Product.findByPk(req.baseUrl.split('/')[3])
    if (!product) {
        throw new Error('Product does not exist')
    }
    return product
}

async function getComment (req: Request) {
    const product = await Product.findByPk(req.baseUrl.split('/')[3])
    const comment = await Comment.findOne({ where: { ProductId: product?.id, id: req.params.id } })

    if (!comment) {
        throw new Error('Comment does not exist')
    }
    return comment
}

router.get('/', async (req, res) => {
    const productId = req.baseUrl.split('/')[3]
    const comments = await Comment.findAll({where:{ProductId: productId}})

    res.status(200).json(comments)
})

router.get('/:id', async (req, res) => {
    try {
        const comment = await getComment(req)

        res.status(200).json(comment)
    } catch (e: any) {
        res.status(404).json(e.message)
    }
})

router.post('/', passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        try {
            const product = await getProduct(req)
            const UserId = req.user!.id
            const {text, rating} = req.body
            const comment = await Comment.create({text, rating, UserId, ProductId: product.id})
            res.status(201).json(comment)
        } catch (e:any) {
            res.status(404).json(e.message)
        }
})

router.patch('/:id', passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        try {
            const comment = await getComment(req)
            if (!_.isEqual(comment.UserId, req.user?.id) && req.user?.role !== 'admin') {
                res.status(403).json({message: 'Forbidden'})
                return
            }
            comment.set(req.body)
            await comment.save()
            res.status(200).json(comment)
        } catch (e: any) {
            res.status(404).json(e.message)
        }
})

router.delete('/:id', passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        try {
            const comment = await getComment(req)
            if (!_.isEqual(comment.UserId, req.user?.id) && req.user?.role !== 'admin') {
                res.status(403).json({message: 'Forbidden'})
                return
            }
            await comment.destroy()
            res.status(200).json({deleted: comment.id})
        } catch (e: any) {
            res.status(404).json(e.message)
        }
    })