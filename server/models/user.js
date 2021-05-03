const DataTypes = require('sequelize');
const { Model } = DataTypes;

module.exports = class User extends Model {
  static init(sequelize) {
    return super.init(
      {
        email: {
          type: DataTypes.STRING(30), // STRING, TEXT, BOOLEAN, INTEGER, FLOAT, DATETIME
          allowNull: false, // 필수
          unique: true, // 고유한 값
        },
        nickname: {
          type: DataTypes.STRING(30),
          allowNull: false, // 필수
        },
        image: {
          type: DataTypes.STRING(200),
        },
        introduction: {
          type: DataTypes.STRING(200),
        },
        password: {
          type: DataTypes.STRING(72),
          allowNull: false, // 필수
        },
        status: {
          type: DataTypes.TINYINT,
          // 0 : pending, 1 : authenticated
          defaultValue: 0,
        },
        // token: {
        //   type: DataTypes.STRING(200),
        //   allowNull: false,
        // },
        role: {
          // admin 2
          // manager 1
          // normal 0
          type: DataTypes.INTEGER,
          defaultValue: 0,
        },
      },
      {
        modelName: 'User',
        tableName: 'users',
        charset: 'utf8',
        collate: 'utf8_general_ci', // 한글 저장
        sequelize,
      }
    );
  }
  static associate(db) {
    db.User.hasOne(db.Image);
    // db.User.hasMany(db.Post);
    // db.User.hasMany(db.Comment);
    // db.User.belongsToMany(db.Post, { through: 'PostLike', as: 'Liked' });
    // db.User.belongsToMany(db.User, {
    //   through: 'Follow',
    //   as: 'Followers',
    //   foreignKey: 'FollowingId',
    // });
    // db.User.belongsToMany(db.User, {
    //   through: 'Follow',
    //   as: 'Followings',
    //   foreignKey: 'FollowerId',
    // });
  }
};
