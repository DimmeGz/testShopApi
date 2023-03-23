import {CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model} from 'sequelize'
import {sequelize} from '../utils/postgresqlConnect'
import {User} from '../user/user.model'
import {Product} from '../catalog/product.model'

interface OrderModel extends Model<InferAttributes<OrderModel>, InferCreationAttributes<OrderModel>> {
    id: CreationOptional<number>
    qty: number
    sum: number
    UserId: number
    ProductId: number
}

export const Order = sequelize.define<OrderModel>('Order', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    qty: {
        type:DataTypes.SMALLINT,
    },
    sum: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    UserId: {
        type: DataTypes.SMALLINT
    },
    ProductId: {
        type: DataTypes.SMALLINT
    }
})

User.hasMany(Order)
Order.belongsTo(User)

Product.hasMany(Order)
Order.belongsTo(Product)
