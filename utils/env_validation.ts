import Joi from "joi"
import fs from "fs/promises"

const joiSchema = Joi.object({
    S3_BUCKET: Joi.string().required(),
    SECRET_KEY: Joi.string().required(),
    MONGO_URL: Joi.string().required(),
    PORT: Joi.string().required(),
    MIGRATE: Joi.string().optional().allow(''),
    MIGRATION_TYPE: Joi.string().default('up').required(),
    JWT_SECRET: Joi.string().required(),
})

async function getFile () {
    const envValues: { [key: string]: any } = {}
    try {
        await fs.readFile('./.env', 'utf8').then(data => {
            const lines = data.split('\n')
            for (let line of lines) {
                const element = line.split(/=(.*)/s)
                envValues[element[0]] = element[1]
            }
        })
        return envValues
    } catch (e) {
        throw Error ('.env file not found')
    }
}

export async function getEnv() {
    const envValues = await getFile()

    try {
        await joiSchema.validateAsync(envValues)
        return envValues
    } catch (err) {
        throw new Error('.env values error')
    }
}