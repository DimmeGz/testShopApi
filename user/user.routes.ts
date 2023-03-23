import express, {Router} from 'express'

import {User} from './user.model'
import jwt from "jsonwebtoken"
import passport from "../middleware/passport"
import {Op} from 'sequelize'
import bcrypt from 'bcryptjs'

export const router = Router()

router.get('/', passport.authenticate('jwt', { session: false }),
    async (req, res) => {
    try {
        if (req.user?.role === 'admin') {
            const users = await User.findAll()
            res.json(users)
        } else {
            res.status(403).json({message: 'You don\'t have permission to access this resource'})
        }
    } catch (e) {
        res.status(500).json({message: 'something went wrong'})
    }
})

router.get('/:id', passport.authenticate('jwt', { session: false }),
    async (req, res) => {
    try {
        if (req.user?.role === 'admin' || req.params.id === JSON.stringify(req.user?.id)) {
            const user = await User.findByPk(req.params.id)
            if (!user) {
                res.status(404).json({message: 'User does not exist'})
                return
            }
            res.status(200).json(user)
        } else {
            res.status(403).json({message: 'You don\'t have permission to access this resource'})
        }
    } catch (e) {
        res.status(404).json(e)
    }
})

router.post('/',
    async (req: express.Request, res: express.Response) => {
        try {
            const {name, phone, email, password} = req.body
            const existingUser = await User.findOne({ where: { [Op.or]: [{ name }, { phone }, { email }]}})

            if (existingUser) {
                return res.status(400).json({message: 'Such user exists'})
            }

            const hashed_password = await bcrypt.hash(password, 12)
            const user: any = await User.create({name, phone, email, password: hashed_password, role: 'user'})

            const JWTKey = process.env.JWT_SECRET
            const body = { _id: user.id, email: user.email }
            const token = jwt.sign({ user: body }, JWTKey!)

            return res.status(200).json({ token })
        } catch (e) {
            console.log(e)
            res.status(400).json({message: 'Incorrect data'})
        }
    })

router.patch('/:id', passport.authenticate('jwt', { session: false }),
    async (req: express.Request, res: express.Response) => {
        try {
            if (req.user?.role === 'admin' || req.params.id === JSON.stringify(req.user?.id)) {
                const user = await User.findByPk(req.params.id)

                if (!user) {
                    res.status(404).json({message: 'User does not exist'})
                    return
                }
                if (req.user?.role !== 'admin'){
                    req.body.role = 'user'
                }
                if (req.body.password) {
                    req.body.password = await bcrypt.hash(req.body.password, 12)
                }
                user.set(req.body)
                await user.save()
                res.status(200).json('User updated')
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
            const user = await User.findByPk(req.params.id)
            if (!user) {
                res.status(404).json({message: 'User does not exist'})
                return
            }
            await user.destroy()
            res.status(200).json('User deleted')
        } else {
            res.status(403).json({message: 'You don\'t have permission to access this resource'})
        }
    } catch (e) {
        res.status(404).json({message: 'Bad request'})
    }
})