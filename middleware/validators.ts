import Joi from "joi"
import {Request, Response} from "express"
import {Error} from "mongoose"
import {User} from "../user/user.schema"
import {Product} from "../product/product.schema"

const phoneJoi = Joi.extend(require('joi-phone-number'))
const JoiObjectId = require('joi-objectid')(Joi)

const userSchema = {
    name: Joi.string()
        .min(4)
        .max(30),
    phone: phoneJoi.string()
        .phoneNumber({defaultCountry: 'uk-UA'})
        .messages({'phoneNumber.invalid': 'Required format:+38AAABBBCCDD'}),
    email: Joi.string()
        .email({minDomainSegments: 2}),
    password: Joi.string()
        .min(6)
}

const userPostJoiSchema = Joi.object(userSchema)
    .fork(Object.keys(userSchema), (schema) => schema.required())
const userPatchJoiSchema = Joi.object(userSchema).keys({role: Joi.string().valid('user','admin')})

const productPostJoiSchema = Joi.object({
    name: Joi.string()
        .min(4)
        .max(30)
        .required(),
    price: Joi.number()
        .min(0)
        .required(),
    isAvailable: Joi.boolean()
        .required(),
    description: Joi.string()
        .optional(),
    image: Joi.string()
        .optional()
})

const productPatchJoiSchema = Joi.object({
    name: Joi.string()
        .min(4)
        .max(30)
        .optional(),
    price: Joi.number()
        .min(0)
        .optional(),
    isAvailable: Joi.boolean()
        .optional(),
    description: Joi.string()
        .optional(),
    image: Joi.string()
        .optional()
})

const existingUser = async (value: string) => {
    if (value) {
        try {
            const user = await User.findById(value)
            if (!user) {
                throw new Error('Record does not exist')
            }
            return user
        } catch (e: any) {
            throw new Error('Record does not exist')
        }
    }
}

const existingProduct = async (value: string) => {
    if (value) {
        try {
            const user = await Product.findById(value)
            if (!user) {
                throw new Error('Record does not exist')
            }
            return user
        } catch (e: any) {
            throw new Error('Record does not exist')
        }
    }
}

const orderPostJoiSchema = Joi.object({
    user: JoiObjectId()
        .external(existingUser)
        .optional(),
    product: JoiObjectId()
        .external(existingProduct)
        .required(),
    qty: Joi.number()
        .integer()
        .min(1)
        .required()
})

const orderPatchJoiSchema = Joi.object({
    user: JoiObjectId()
        .external(existingUser)
        .optional(),
    product: JoiObjectId()
        .external(existingProduct)
        .optional(),
    qty: Joi.number()
        .integer()
        .min(1)
        .optional()
})

const authEmailJoiSchema = Joi.object({
    authField: Joi.string()
        .email({minDomainSegments: 2}),
    password: Joi.string()
        .min(6).required()
})

const authPhoneJoiSchema = Joi.object({
    authField: phoneJoi.string()
        .phoneNumber({defaultCountry: 'uk-UA'})
        .messages({'phoneNumber.invalid': 'Required format:+38AAABBBCCDD'}),
    password: Joi.string()
        .min(6).required()
})

const authJoiSchema = Joi.alternatives(authEmailJoiSchema , authPhoneJoiSchema)

const schema: Record<string, any> = {
    user: {
        POST: userPostJoiSchema,
        PATCH: userPatchJoiSchema
    },
    product: {
        POST: productPostJoiSchema,
        PATCH: productPatchJoiSchema
    },
    order: {
        POST: orderPostJoiSchema,
        PATCH: orderPatchJoiSchema
    },
    auth: {
        POST: authJoiSchema,
    }
}

export async function dataValidation(req: Request, res: Response, next: any) {
    const targetApi = req.path.split('/')[2]

    if (!schema[targetApi] || !schema[targetApi][req.method]) {
        next()
    } else {
        try {
            await schema[targetApi][req.method].validateAsync(req.body)
            next()
        } catch (e: any) {
            res.status(404).json({message: e.message})
        }
    }
}
