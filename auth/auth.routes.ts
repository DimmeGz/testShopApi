import {Router, Request, Response} from 'express'
import {User} from "../user/user.schema";

export const router = Router()

router.post('/',async (req: Request, res: Response) => {
    try {
        console.log(req.body)
        res.json('users')
    } catch (e) {
        res.status(404).json({message: 'Bad request'})
    }
})

