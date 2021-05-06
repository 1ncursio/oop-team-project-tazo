const DataTypes = require('sequelize');
const { Model } = DataTypes;

module.exports = class PostImage extends Model {
  static init(sequelize) {
    return super.init(
      {
        // id가 기본적으로 들어있다.
        src: {
          type: DataTypes.STRING(200),
          allowNull: false,
        },
      },
      {
        modelName: 'PostImage',
        tableName: 'postImages',
        charset: 'utf8',
        collate: 'utf8_general_ci',
        sequelize,
      }
    );
  }
  static associate(db) {
    db.Image.belongsTo(db.User);
  }
};
