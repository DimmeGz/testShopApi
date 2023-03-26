import {CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model} from 'sequelize'
import {sequelize} from '../utils/postgresqlConnect'
import {User} from '../user/user.model'
import {Product} from "../catalog/product.model"

interface OrderModel extends Model<InferAttributes<OrderModel>, InferCreationAttributes<OrderModel>> {
    id: CreationOptional<number>
    sum: number
    UserId: number
    status: string
}

export const Order = sequelize.define<OrderModel>('Order', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    sum: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    UserId: {
        type: DataTypes.SMALLINT
    },
    status: {
        type:DataTypes.ENUM('created', 'placed', 'in progress', 'completed', 'cancelled'),
        defaultValue: 'created',
    },
})

User.hasMany(Order)
Order.belongsTo(User)

interface OrderRowModel extends Model<InferAttributes<OrderRowModel>, InferCreationAttributes<OrderRowModel>> {
    id: CreationOptional<number>
    qty: number
    OrderId: number
    ProductId: number
}

export const OrderRow = sequelize.define<OrderRowModel>('Row', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    qty: {
        type: DataTypes.SMALLINT,
        allowNull: false,
    },
    OrderId: {
        type: DataTypes.SMALLINT
    },
    ProductId: {
        type: DataTypes.SMALLINT
    },
})

Order.hasMany(OrderRow)
OrderRow.belongsTo(Order)
