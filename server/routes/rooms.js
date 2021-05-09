const express = require('express');
const router = express.Router();
const { sequelize, Room, RoomMember, User } = require('../models');
const { isLoggedIn } = require('./middlewares');

router.get('/', async (req, res, next) => {
  try {
    const rooms = await Room.findAll();
    return res.json(rooms);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.post('/', isLoggedIn, async (req, res, next) => {
  const { name } = req.body;
  const transaction = await sequelize.transaction();
  try {
    const room = await Room.create({ name, OwnerId: req.user.id }, { transaction });
    await room.addMembers(req.user.id, { transaction });
    await transaction.commit();

    const roomWithUser = await Room.findOne({ where: { id: room.id }, include: [{ model: User, attributes: ['id', 'nickname', 'image'] }] });

    const io = req.app.get('io');
    io.of(`/room-${room.id}`).emit('room', roomWithUser);
    return res.send('ok');
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
