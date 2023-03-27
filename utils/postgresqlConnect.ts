import * as dotenv from 'dotenv'
dotenv.config()

import {Sequelize} from 'sequelize'

export const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite'
})

export async function connectDB() {
    try {
        await sequelize.authenticate()
        await sequelize.sync({ force: false })
        console.log('Connection has been established successfully.')
    } catch (error) {
        console.error('Unable to connect to the database:', error)
    }
}