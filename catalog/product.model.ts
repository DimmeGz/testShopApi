import { Model, InferAttributes, InferCreationAttributes, CreationOptional, DataTypes } from 'sequelize'
import {sequelize} from '../utils/postgresqlConnect'
import {User} from '../user/user.model';
import {Order, OrderRow} from '../order/order.models';

interface ProductModel extends Model<InferAttributes<ProductModel>, InferCreationAttributes<ProductModel>> {
    id: CreationOptional<number>
    name: string;
    description: string
    image: string
    price: number
    isAvailable: boolean
    CategoryId: number

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
    image: {
        type: DataTypes.STRING
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
    }
})

Product.hasMany(OrderRow)
OrderRow.belongsTo(Product)