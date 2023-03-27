import { Model, InferAttributes, InferCreationAttributes, CreationOptional, DataTypes } from 'sequelize'
import {sequelize} from '../utils/postgresqlConnect'
import {Order, OrderRow} from '../order/order.models'

interface ProductModel extends Model<InferAttributes<ProductModel>, InferCreationAttributes<ProductModel>> {
    id: CreationOptional<number>
    name: string
    description: string
    price: number
    isAvailable: boolean
    CategoryId: number
    buyersCount: number
    rating: number
}

export const Product = sequelize.define<ProductModel>('Product', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
    },
    description: {
        type: DataTypes.STRING,
    },
    price: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    isAvailable: {
        type:DataTypes.BOOLEAN,
        defaultValue: true,
    },
    CategoryId: {
        type: DataTypes.SMALLINT
    },
    buyersCount: {
        type: DataTypes.SMALLINT,
        allowNull: true,
    },
    rating: {
        type: DataTypes.FLOAT,
        allowNull: true,
    }
})

Product.hasMany(OrderRow)
OrderRow.belongsTo(Product)