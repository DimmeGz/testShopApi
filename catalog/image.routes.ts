import {Router} from 'express'
import {Image} from './image.model'
import passport from '../middleware/passport'
import jwt from 'jsonwebtoken'

export const router = Router()


router.get('/', async (req, res) => {
    const images = await Image.findAll()
    res.status(200).json(images)
})

router.get('/:id', async (req, res) => {
    try {
        const image = await Image.findByPk(req.params.id)
        if (!image) {
            res.status(404).json({message: 'Comment does not exist'})
            return
        }
        res.status(200).json(image)
    } catch (e: any) {
        res.status(404).json(e.message)
    }
})

router.post('/', passport.authenticate('jwt', {session: false}),
    async (req, res) => {
        try {
            if (req.user!.role === 'admin') {
                const image = await Image.create(req.body)
                res.status(201).json(image)
            } else {
                res.status(403).json({message: 'Forbidden'})
            }
        } catch (e: any) {
            res.status(404).json(e.message)
        }
    })

router.patch('/:id', passport.authenticate('jwt', {session: false}),
    async (req, res) => {
        try {
            if (req.user!.role === 'admin') {
                const image = await Image.findByPk(req.params.id)
                image?.set(req.body)
                image?.save()
                res.status(201).json(image)
            } else {
                res.status(403).json({message: 'Forbidden'})
            }
        } catch (e: any) {
            res.status(404).json(e.message)
        }
    })

router.delete('/:id', passport.authenticate('jwt', {session: false}),
    async (req, res) => {
        try {
            if (req.user!.role === 'admin') {
                const image = await Image.findByPk(req.params.id)
                image?.destroy()
                res.status(201).json(image)
            } else {
                res.status(403).json({message: 'Forbidden'})
            }
        } catch (e: any) {
            res.status(404).json(e.message)
        }
    })