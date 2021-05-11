const express = require('express');
const router = express.Router();
const { sequelize, Room, User } = require('../models');
const { isLoggedIn } = require('./middlewares');

router.get('/', async (req, res, next) => {
  try {
    const rooms = await Room.findAll({
      include: [
        {
          model: User, // 포스트 작성자
          as: 'Owner',
          attributes: ['id', 'nickname', 'image'],
        },
        {
          model: User,
          as: 'Members',
          attributes: ['id', 'nickname', 'image'],
        },
      ],
    });
    return res.json(rooms);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.post('/', isLoggedIn, async (req, res, next) => {
  const { name, userLimit } = req.body;
  const transaction = await sequelize.transaction();
  try {
    const exRoom = await Room.findOne({ where: { OwnerId: req.user.id }, transaction });
    if (exRoom) {
      return res.status(403).send('방은 2개 이상 만들 수 없습니다.');
    }
    const room = await Room.create({ name, userLimit, OwnerId: req.user.id }, { transaction });
    await room.addMembers(req.user.id, { transaction });
    await transaction.commit();

    const roomWithUser = await Room.findOne({
      where: { id: room.id },
      include: [
        {
          model: User, // 포스트 작성자
          as: 'Owner',
          attributes: ['id', 'nickname', 'image'],
        },
        {
          model: User,
          as: 'Members',
          attributes: ['id', 'nickname', 'image'],
        },
      ],
    });

    const io = req.app.get('io');
    // io.of(`/room-${room.id}`).emit('roomList', roomWithUser);
    io.of('/ws-room').emit('createRoom', roomWithUser);
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

router.get('/:roomId', async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const room = await Room.findOne({
      where: { id: roomId },
      include: [
        {
          model: User, // 포스트 작성자
          as: 'Owner',
          attributes: ['id', 'nickname', 'image'],
        },
        {
          model: User,
          as: 'Members',
          attributes: ['id', 'nickname', 'image'],
        },
      ],
    });

    if (!room) {
      return res.status(404).json({ success: false, message: '존재하지 않는 방입니다.' });
    }

    res.status(200).json(room);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
