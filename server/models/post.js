const DataTypes = require('sequelize');
const { Model } = DataTypes;

module.exports = class Post extends Model {
  static init(sequelize) {
    return super.init(
      {
        title: {
          type: DataTypes.STRING(50),
          allowNull: false,
        },
        content: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        views: {
          type: DataTypes.INTEGER,
          defaultValue: 0,
        },
        origin: {
          // 출발지
          type: DataTypes.STRING(100),
          allowNull: false,
          defaultValue: '',
        },
        destination: {
          // 도착지
          type: DataTypes.STRING(100),
          allowNull: false,
          defaultValue: '',
        },
        startAt: {
          // 도착지
          type: DataTypes.DATE,
          allowNull: false,
        },
      },
      {
        modelName: 'Post',
        tableName: 'posts',
        charset: 'utf8mb4',
        collate: 'utf8mb4_general_ci', // 이모티콘 저장
        sequelize,
      }
    );
  }
  static associate(db) {
    db.Post.belongsTo(db.User); // post.addUser, post.getUser, post.setUser
    // db.Post.belongsToMany(db.Tag, { through: 'PostTag' }); // post.addHashtags
    db.Post.hasMany(db.Comment); // post.addComments, post.getComments
    db.Post.hasMany(db.PostImage); // post.addPostImages, post.getPostImages
    // db.Post.belongsToMany(db.User, { through: 'PostLike', as: 'Likers' }); // post.addLikers, post.removeLikers
  }
};
