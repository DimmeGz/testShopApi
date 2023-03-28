import {CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model} from 'sequelize'
import {sequelize} from '../utils/postgresqlConnect'
import {Product} from './product.model'
import {User} from '../user/user.model'

interface CommentModel extends Model<InferAttributes<CommentModel>, InferCreationAttributes<CommentModel>> {
    id: CreationOptional<number>
    ProductId: number
    UserId: number
    text: string
}

export const Comment = sequelize.define<CommentModel>('Comment', {
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
    text: {
        type: DataTypes.STRING,
        allowNull: false,
    }
})

Product.hasMany(Comment)
Comment.belongsTo(Product)

User.hasMany(Comment)
Comment.belongsTo(User)

