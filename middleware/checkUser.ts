import {Request, Response} from 'express'
import jwt from 'jsonwebtoken'
import {Op} from 'sequelize'
import {User} from '../user/user.model'

export async function checkUser(req: Request, res: Response, next: any){
    const token = req.headers['authorization']?.split(' ')[1]


    if (req.headers && req.headers.authorization) {
        const authorization = req.headers.authorization.split(' ')[1]
        try {
            const decoded = jwt.verify(authorization, process.env.JWT_SECRET!);
            // @ts-ignore
            const authField = (decoded.user[Object.keys(decoded.user)[0]])
            const user = await User.findOne({ where: { [Op.or]: [{ email: authField }, { phone: authField }]}})
            // @ts-ignore
            if (user.role === 'admin') {
                req.userRole = 'admin'
                next()
            } else {
                req.userRole = 'user'
                next()
            }
        } catch (e) {
            req.userRole = 'user'
            next()
        }
    } else {
        req.userRole = 'user'
        next()
    }
}