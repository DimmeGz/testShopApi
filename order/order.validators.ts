import {body} from "express-validator"
import {Product} from "../product/Product.schema"
import {User} from "../user/User.schema"

export const orderValidators = [
    body('user')
        .custom(async value => {
            if (value.match(/^[0-9a-fA-F]{24}$/)) {
                const user = await User.findById(value)
                if (!user) {
                    throw new Error('User does not exist')
                }
                return true
            }
            throw new Error('User does not exist')
        }),
    body('product')
        .custom(async value => {
            if (value.match(/^[0-9a-fA-F]{24}$/)) {
                const product = await Product.findById(value)
                if (!product) {
                    throw new Error('Product does not exist')
                }
                return true
            }
            throw new Error('Product does not exist')
        }),
    body('qty').isInt({min: 1, max: 999}),
]