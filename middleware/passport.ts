const passport = require('passport')
const localStrategy = require('passport-local').Strategy
import {User} from "../user/user.schema"

const JWTstrategy = require('passport-jwt').Strategy
const ExtractJWT = require('passport-jwt').ExtractJwt

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
                const user = await User.findOne({ $or:[ {'email':authField}, {'phone':authField} ]})

                if (!user) {
                    return done(null, false, { message: 'User not found' })
                }

                const validate = await user.isValidPassword(password)

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
            jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken()        // se
        },
        async (token: any, done: any) => {
            try {
                return done(null, token.user);
            } catch (error) {
                done(error)
            }
        }
    )
)

export default passport