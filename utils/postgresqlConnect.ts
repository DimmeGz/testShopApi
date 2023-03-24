import * as dotenv from 'dotenv'
dotenv.config()

import {Sequelize} from 'sequelize'

export const sequelize = new Sequelize(process.env.PSQL_URL!, {
    dialect: 'postgres'
})

export async function connectDB() {
    try {
        await sequelize.authenticate()
        console.log('Connection has been established successfully.')
    } catch (error) {
        console.error('Unable to connect to the database:', error)
    }
}