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
  }
};
