const DataTypes = require('sequelize');
const { Model } = DataTypes;

module.exports = class User extends Model {
  static init(sequelize) {
    return super.init(
      {
        email: {
          type: DataTypes.STRING(30), // STRING, TEXT, BOOLEAN, INTEGER, FLOAT, DATETIME
          allowNull: true,
          unique: true, // 고유한 값
        },
        nickname: {
          type: DataTypes.STRING(30),
          allowNull: false, // 필수
        },
        image: {
          type: DataTypes.STRING(200),
          allowNull: true,
        },
        introduction: {
          type: DataTypes.STRING(200),
          allowNull: true,
        },
        password: {
          type: DataTypes.STRING(72),
          allowNull: true,
        },
        provider: {
          type: DataTypes.STRING(10),
          defaultValue: 'local',
        },
        snsId: {
          type: DataTypes.STRING(30),
          allowNull: true,
        },
        status: {
          type: DataTypes.TINYINT,
          // 0 : pending, 1 : authenticated
          defaultValue: 0,
        },
        gender: {
          // 성별
          type: DataTypes.STRING(10),
          allowNull: true,
        },
        // token: {
        //   type: DataTypes.STRING(200),
        //   allowNull: false,
        // },
        role: {
          // admin 2
          // manager 1
          // normal 0
          type: DataTypes.TINYINT,
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
    db.User.hasMany(db.Post);
    db.User.hasMany(db.PostComment);
    db.User.hasMany(db.RoomChat);
    db.User.hasOne(db.Room, { as: 'Owned', foreignKey: 'OwnerId' });
    db.User.belongsToMany(db.Room, { through: db.RoomMember, as: 'Rooms' });
  }
};
