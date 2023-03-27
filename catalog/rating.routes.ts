import  {Request, Response, Router} from 'express'
import {Rating} from './rating.model'
import passport from '../middleware/passport'
import jwt from 'jsonwebtoken'
import _ from 'lodash'

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
            const ratingObj = await Rating.create({rating, UserId, ProductId})
            res.status(201).json(ratingObj)
        } catch (e: any) {
            res.status(404).json(e.message)
        }
    })

router.patch('/:id', passport.authenticate('jwt', {session: false}),
    async (req, res) => {
        try {
            const ratingObj = await getRatingCheckEditable(req, res)
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
            await ratingObj.destroy()
            res.status(200).json({deleted: ratingObj.id})
        } catch (e: any) {
            if (!res.status) {
                res.status(500)
            }
            res.json(e.message)
        }
    })