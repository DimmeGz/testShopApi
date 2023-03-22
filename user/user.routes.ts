import express, {Router} from 'express'

import {User} from './user.schema'
import jwt from "jsonwebtoken"

export const router = Router()

router.get('/', async (req, res) => {
    try {
        const users = await User.find()
        res.json(users)
    } catch (e) {
        res.status(500).json({message: 'something went wrong'})
    }
})

router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user) {
            res.status(404).json({message: 'User does not exist'})
            return
        }
        res.status(200).json(user)
    } catch (e) {
        res.status(404).json(e)
    }
})

router.post('/',
    async (req: express.Request, res: express.Response) => {
        try {
            const {name, phone, email, password} = req.body
            const existingUser = await User.findOne({phone})
            const existingUser2 = await User.findOne({email})
            const existingUser3 = await User.findOne({name})
            if (existingUser || existingUser2 || existingUser3) {
                return res.status(400).json({message: 'Such user exists'})
            }

            const user = new User({name, phone, email, password, role: 'user'})
            await user.save()

            const JWTKey = process.env.JWT_SECRET
            const body = { _id: user._id, email: user.email }
            const token = jwt.sign({ user: body }, JWTKey!)

            return res.status(200).json({ token })
        } catch (e) {
            console.log(e)
            res.status(400).json({message: 'Incorrect data'})
        }
    })

router.patch('/:id',
    async (req: express.Request, res: express.Response) => {
        try {
            const params = req.body
            const user = await User.findById(req.params.id)

            if (!user) {
                res.status(404).json({message: 'User does not exist'})
                return
            }

            Object.assign(user, params)
            await user.save()
            res.status(200).json('User updated')
        } catch (e) {
            res.status(404).json({message: 'Bad request'})
        }
    })

router.delete('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user) {
            res.status(404).json({message: 'User does not exist'})
            return
        }
        await user.deleteOne()
        res.status(200).json('User deleted')
    } catch (e) {
        res.status(404).json({message: 'Bad request'})
    }
})