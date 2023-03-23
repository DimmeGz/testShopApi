import {DataTypes} from 'sequelize'
import {sequelize} from '../utils/postgresqlConnect'

export const User = sequelize.define('User', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
    },
    role: {
        type:DataTypes.ENUM('admin', 'user'),
        defaultValue: 'user',
    }
})

interface IUser {
    id: string
    name: string
    password: string
    phone: string
    email: string
    role: string
}

declare global {
    namespace Express {
        interface User extends IUser {}
    }
}
