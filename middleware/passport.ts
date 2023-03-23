const passport = require('passport')
const localStrategy = require('passport-local').Strategy
import bcrypt from 'bcryptjs'
const JWTstrategy = require('passport-jwt').Strategy

const ExtractJWT = require('passport-jwt').ExtractJwt
const { Op } = require("sequelize")

import {User} from "../user/user.model"

const JWTKey = process.env.JWT_SECRET

passport.use(
    'login',
    new localStrategy(
        {
            usernameField: 'authField',
            passwordField: 'password'
        },
        async (authField: string, password: string, done: any) => {
            try {
                const user = await User.findOne({ where: { [Op.or]: [{ email: authField }, { phone: authField }]}})

                if (!user) {
                    return done(null, false, { message: 'User not found' })
                }

                const validate = await bcrypt.compare(password, user.dataValues.password)

                if (!validate) {
                    return done(null, false, { message: 'Wrong Password' })
                }

                return done(null, user, { message: 'Logged in Successfully' })
            } catch (error) {
                return done(error)
            }
        }
    )
)

passport.use(
    new JWTstrategy(
        {
            secretOrKey: JWTKey,
            jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken()
        },
        async (token: any, done: any) => {
            try {
                const activeUser = await User.findOne({ where: { email: token.user[Object.keys(token.user)[0]] }})
                return done(null, activeUser)
            } catch (error) {
                done(error)
            }
        }
    )
)

export default passport