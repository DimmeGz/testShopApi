import {Router} from 'express'
import jwt from "jsonwebtoken"

import passport from "../middleware/passport"
export const router = Router()

const JWTKey = process.env.JWT_SECRET

router.post(
    '/',
    async (req, res, next) => {
        passport.authenticate(
            'login',
            async (err: any, user: any, info: any) => {
                try {
                    if (err || !user) {
                        return res.status(401).json(info)
                    }

                    req.login(
                        user,
                        { session: false },
                        async (error) => {
                            if (error) return next(error)

                            const body = { _id: user._id, email: user.email }
                            const token = jwt.sign({ user: body }, JWTKey!)

                            return res.json({ token })
                        }
                    )
                } catch (error) {
                    return next(error)
                }
            }
        )(req, res, next)
    }
)