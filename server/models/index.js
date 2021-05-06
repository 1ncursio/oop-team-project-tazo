const Sequelize = require('sequelize');
const user = require('./user');
const post = require('./post');
const postImage = require('./postImage');
const postComment = require('./postComment');
// const Tag = require('./tag');
const room = require('./room');
const roomMember = require('./roomMember');
const roomChat = require('./roomChat');
const friend = require('./friend');

const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];
const db = {};

const sequelize = new Sequelize(config.database, config.username, config.password, config);

db.User = user;
db.Post = post;
db.PostImage = postImage;
db.PostComment = postComment;
db.Room = room;
db.RoomMember = roomMember;
db.RoomChat = roomChat;
db.Friend = friend;

Object.keys(db).forEach((modelName) => {
  db[modelName].init(sequelize);
});

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
