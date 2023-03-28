import {CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model} from 'sequelize'
import {sequelize} from '../utils/postgresqlConnect'
import {Product} from './product.model'
import {User} from '../user/user.model'

interface RatingModel extends Model<InferAttributes<RatingModel>, InferCreationAttributes<RatingModel>> {
    id: CreationOptional<number>
    UserId: number
    ProductId: number
    rating: number
}

export const Rating = sequelize.define<RatingModel>('Rating', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    ProductId: {
        type: DataTypes.SMALLINT
    },
    UserId: {
        type: DataTypes.SMALLINT
    },
    rating: {
        type: DataTypes.SMALLINT,
        validate: {
            min: 0,
            max: 5
        }
    }
})

Product.hasMany(Rating)
Rating.belongsTo(Product)

User.hasMany(Rating)
Rating.belongsTo(User)