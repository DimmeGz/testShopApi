import {CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model} from 'sequelize'
import {sequelize} from '../utils/postgresqlConnect'

interface UserModel extends Model<InferAttributes<UserModel>, InferCreationAttributes<UserModel>> {
    id: CreationOptional<number>
    name: string
    password: string
    phone: string
    email: string
    role: string

}

export const User = sequelize.define<UserModel>('User', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
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
    id: number
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
