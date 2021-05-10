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
    const exRoom = await Room.findOne({ where: { OwnerId: req.user.id }, transaction });
    if (exRoom) {
      return res.status(403).send('방은 2개 이상 만들 수 없습니다.');
    }
    const room = await Room.create({ name, OwnerId: req.user.id }, { transaction });
    await room.addMembers(req.user.id, { transaction });
    await transaction.commit();

    const roomWithUser = await Room.findOne({
      where: { id: room.id },
      // include: [{ model: User, attributes: ['id', 'nickname', 'image'] }],
    });

    const io = req.app.get('io');
    // io.of(`/room-${room.id}`).emit('roomList', roomWithUser);
    io.of('/room-room').emit('roomList', roomWithUser);
    return res.send('ok');
  } catch (error) {
    console.error(error);
    await transaction.rollback();
    next(error);
  }
});

router.delete('/:roomId', isLoggedIn, async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { roomId } = req.params;
    const room = await Room.findOne({ where: { id: roomId }, transaction });
    await room.removeMembers(req.user.id, { transaction });
    await Room.destroy({ where: { id: roomId }, transaction });
    await transaction.commit();

    res.send('ok');
  } catch (error) {
    console.error(error);
    await transaction.rollback();
    next(error);
  }
});

module.exports = router;
