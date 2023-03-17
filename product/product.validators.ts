import {body} from "express-validator"

export const productValidators = [
    body('name').isLength({min: 4}),
    body('price').isFloat({min: 0}),
    body('isAvailable').isBoolean()
]