const DataTypes = require('sequelize');
const { Model } = DataTypes;

module.exports = class Post extends Model {
  static init(sequelize) {
    return super.init(
      {
        title: {
          type: DataTypes.STRING(50),
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
        },
        destination: {
          // 도착지
          type: DataTypes.STRING(100),
        },
        startAt: {
          // 만나는 시간
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
        },
        gender: {
          // 성별
          type: DataTypes.STRING,
          allowNull: true,
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
    db.Post.hasMany(db.PostComment); // post.addPostComments, post.getPostComments
    db.Post.hasMany(db.PostImage); // post.addPostImages, post.getPostImages
  }
};
