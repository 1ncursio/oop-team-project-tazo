const DataTypes = require('sequelize');
const { DEFAULT_LATITUDE, DEFAULT_LONGITUDE } = require('../utils/defaultLatLng');
const { Model } = DataTypes;

module.exports = class Room extends Model {
  static init(sequelize) {
    return super.init(
      {
        name: {
          type: DataTypes.STRING(30),
          allowNull: false,
        },
        userLimit: {
          type: DataTypes.TINYINT,
          allowNull: false,
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
        originName: {
          // 출발지 이름
          type: DataTypes.STRING(50),
          allowNull: false,
        },
        destinationName: {
          // 도착지 이름
          type: DataTypes.STRING(50),
          allowNull: false,
        },
        startAt: {
          // 만나는 시간
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
          allowNull: false,
        },
        gender: {
          // 성별
          type: DataTypes.STRING(6),
          allowNull: false,
          defaultValue: 'male',
        },
      },
      {
        modelName: 'Room',
        tableName: 'rooms',
        charset: 'utf8mb4',
        collate: 'utf8mb4_general_ci',
        sequelize,
      }
    );
  }
  static associate(db) {
    // db.Room.belongsTo(db.User);
    db.Room.hasMany(db.RoomChat);
    // db.Room.belongsTo(db.User, { as: 'Owner', foreignKey: 'OwnerId' });
    db.Room.belongsToMany(db.User, { through: db.RoomMember, as: 'Members' });
  }
};
