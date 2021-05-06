const DataTypes = require('sequelize');
const { Model } = DataTypes;

module.exports = class PostComment extends Model {
  static init(sequelize) {
    return super.init(
      {
        content: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        // replyId: {
        //   type: DataTypes.INTEGER,
        //   allowNull: true,
        // },
        // UserId: 1
        // PostId: 3
      },
      {
        modelName: 'PostComment',
        tableName: 'postComments',
        charset: 'utf8mb4',
        collate: 'utf8mb4_general_ci', // 이모티콘 저장
        sequelize,
      }
    );
  }

  static associate(db) {
    db.PostComment.belongsTo(db.User);
    db.PostComment.belongsTo(db.Post);
    db.PostComment.hasMany(db.PostComment, { as: 'reply', foreignKey: 'replyId' });
  }
};
