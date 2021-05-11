const DataTypes = require('sequelize');
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
        modelName: 'Room',
        tableName: 'rooms',
        charset: 'utf8',
        collate: 'utf8_general_ci',
        sequelize,
      }
    );
  }
  static associate(db) {
    // db.Room.belongsTo(db.User);
    db.Room.hasMany(db.RoomChat);
    db.Room.belongsTo(db.User, { as: 'Owner', foreignKey: 'OwnerId' });
    db.Room.belongsToMany(db.User, { through: db.RoomMember, as: 'Members' });
  }
};
