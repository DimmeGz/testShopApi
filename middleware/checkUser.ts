import {Request, Response} from 'express'
import jwt from 'jsonwebtoken'
import {Op} from 'sequelize'
import {User} from '../user/user.model'

export async function checkUser(req: Request, res: Response, next: any){
    if (req.headers && req.headers.authorization) {
        const authorization = req.headers.authorization.split(' ')[1]
        try {
            req.userRole = 'user'
            const decoded: any = jwt.verify(authorization, process.env.JWT_SECRET!)
            const authField = (decoded.user[Object.keys(decoded.user)[0]])
            const user: any = await User.findOne({ where: { [Op.or]: [{ email: authField }, { phone: authField }]}})
            if (user.role === 'admin') {
                req.userRole = 'admin'
                next()
            } else {
                next()
            }
        } catch (e) {
            next()
        }
    } else {
        next()
    }
}