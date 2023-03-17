import {body} from "express-validator"

export const userValidators = [
    body('name').isLength({min: 4}),
    body('phone').isMobilePhone("uk-UA", undefined),
    body('email').isEmail(),
    body('password').isLength({min: 6})
]