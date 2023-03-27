import {CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model} from 'sequelize'
import {sequelize} from '../utils/postgresqlConnect'
import {Product} from './product.model'

interface ImageModel extends Model<InferAttributes<ImageModel>, InferCreationAttributes<ImageModel>> {
    id: CreationOptional<number>
    ProductId: number
    imageUrl: string
}

export const Image = sequelize.define<ImageModel>('Image', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    ProductId: {
        type: DataTypes.SMALLINT
    },
    imageUrl: {
        type: DataTypes.STRING,
        allowNull: false,
    }
})

Product.hasMany(Image)
Image.belongsTo(Product)
