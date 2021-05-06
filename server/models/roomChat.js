const DataTypes = require('sequelize');
const { Model } = DataTypes;

module.exports = class RoomChat extends Model {
  static init(sequelize) {
    return super.init(
      {
        content: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
      },
      {
        modelName: 'RoomChat',
        tableName: 'roomChats',
        charset: 'utf8mb4',
        collate: 'utf8mb4_general_ci', // 이모티콘 저장
        sequelize,
      }
    );
  }

  static associate(db) {
    db.RoomChat.belongsTo(db.User);
    db.RoomChat.belongsTo(db.Room);
  }
};
