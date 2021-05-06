const DataTypes = require('sequelize');
const { Model } = DataTypes;

module.exports = class RoomMember extends Model {
  static init(sequelize) {
    return super.init(
      {
        loggedInAt: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
        },
      },
      {
        modelName: 'RoomMember',
        tableName: 'roomMembers',
        charset: 'utf8',
        collate: 'utf8_general_ci', // 한글 저장
        sequelize,
      }
    );
  }
  static associate(db) {}
};
