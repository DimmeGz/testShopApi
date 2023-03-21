import {Router, Request, Response} from 'express'
import {User} from "../user/user.schema"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

export const router = Router()

router.post('/',async (req: Request, res: Response) => {
    try {
        const {auth, password} = req.body
        const user = await User.findOne({ $or:[ {'email':auth}, {'phone':auth} ]})

        if (!user) {
            return res.status(400).json({ message: 'User does not exist' })
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (!isMatch) {
            return res.status(400).json({ message: 'Wrong password. Try again.' })
        }

        const jwtKey = process.env.JWT_SECRET
        const token = jwt.sign(
            { userId: user.id },
            jwtKey!,
            { expiresIn: '1h' }
        )

        res
            .header('Authorization', 'Bearer '+ token)
            .json({ userId: user.id })
    } catch (e) {
        res.status(404).json({message: 'Bad request'})
    }
})

