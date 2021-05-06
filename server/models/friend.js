const DataTypes = require('sequelize');
const { Model } = DataTypes;

module.exports = class Friend extends Model {
  static init(sequelize) {
    return super.init(
      {
        status: {
          type: DataTypes.TINYINT,
          defaultValue: 0,
        },
      },
      {
        modelName: 'Friend',
        tableName: 'friends',
        charset: 'utf8',
        collate: 'utf8_general_ci', // 한글 저장
        sequelize,
      }
    );
  }
  static associate(db) {
    db.Friend.belongsTo(db.User, { as: 'Friending', foreingKey: 'FriendedId' });
    db.Friend.belongsTo(db.User, { as: 'Friended', foreingKey: 'FriendingId' });
  }
};
