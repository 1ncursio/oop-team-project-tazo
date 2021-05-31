const DataTypes = require('sequelize');
const { DEFAULT_LATITUDE, DEFAULT_LONGITUDE } = require('../utils/defaultLatLng');
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
        originLat: {
          // 출발지 위도
          type: DataTypes.DECIMAL(17, 14),
          defaultValue: DEFAULT_LATITUDE,
          allowNull: false,
        },
        originLng: {
          // 출발지 경도
          type: DataTypes.DECIMAL(17, 14),
          defaultValue: DEFAULT_LONGITUDE,
          allowNull: false,
        },
        destinationLat: {
          // 도착지 위도
          type: DataTypes.DECIMAL(17, 14),
          defaultValue: DEFAULT_LATITUDE,
          allowNull: false,
        },
        destinationLng: {
          // 도착지 경도
          type: DataTypes.DECIMAL(17, 14),
          defaultValue: DEFAULT_LONGITUDE,
          allowNull: false,
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
