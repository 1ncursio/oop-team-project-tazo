const express = require('express');
const { body, validationResult, check } = require('express-validator');
const router = express.Router();
const { sequelize, Room, User, RoomChat, RoomMember } = require('../models');
const { STATUS_403_ROOMMEMBER, STATUS_404_ROOM, STATUS_404_USER } = require('../utils/message');
const { isLoggedIn } = require('./middlewares');
const { upload, uploadGCS, storage, bucket } = require('../utils/upload');
const { createRoomValidator } = require('../utils/validator');

/* 방 라우터 */

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

router.get('/search', async (req, res, next) => {
  try {
    const { userLimit, origin, gender, destination, startAt } = req.query;
    const room = await Room.findAll({ where: { userLimit, origin, gender, destination, startAt } });

    res.status(200).json(room);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.get('/:roomId', isLoggedIn, async (req, res, next) => {
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
      return res.status(404).json({ success: false, message: STATUS_404_ROOM });
    }

    res.status(200).json(room);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.post('/', isLoggedIn, createRoomValidator, async (req, res, next) => {
  // Finds the validation errors in this request and wraps them in an object with handy functions
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const body = {};

  Object.keys(req.body).forEach((key) => {
    body[key] = req.body[key];
  });

  body['OwnerId'] = req.user.id;

  const transaction = await sequelize.transaction();
  try {
    const exRoom = await Room.findOne({ where: { OwnerId: req.user.id } });
    if (exRoom) {
      return res.status(403).json({ success: false, message: '방은 2개 이상 만들 수 없습니다.' });
    }
    const room = await Room.create(body, { transaction });
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
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    await transaction.rollback();
    next(error);
  }
});

router.post('/test', async (req, res, next) => {
  const { name, userLimit } = req.body;
  const transaction = await sequelize.transaction();
  try {
    const exRoom = await Room.findOne({ where: { OwnerId: 1 } });
    if (exRoom) {
      return res.status(403).json({ success: false, message: '방은 2개 이상 만들 수 없습니다.' });
    }
    const room = await Room.create({ name, userLimit, OwnerId: 1 }, { transaction });
    await room.addMembers(1, { transaction });
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
    return res.status(200).json({ success: true });
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

    const io = req.app.get('io');
    io.of('/ws-room').emit('destroyRoom', room);
    return res.send('ok');
  } catch (error) {
    console.error(error);
    await transaction.rollback();
    next(error);
  }
});

/* 채팅 라우터 */

router.get(
  '/:roomId/chat',
  // isLoggedIn,
  async (req, res, next) => {
    try {
      const { roomId } = req.params;

      const room = await Room.findOne({ where: { id: roomId } });
      if (!room) {
        return res.status(404).json({ success: false, message: STATUS_404_ROOM });
      }
      res
        .status(200)
        .json(await room.getRoomChats({ include: [{ model: User, attributes: ['id', 'nickname', 'image'] }] }));
    } catch (error) {
      console.error(error);
      next(error);
    }
  }
);

router.post('/:roomId/chat', isLoggedIn, async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { roomId } = req.params;
    const { content } = req.body;

    const room = await Room.findOne({ where: { id: roomId } });
    if (!room) {
      return res.status(404).json({ success: false, message: STATUS_404_ROOM });
    }

    const chat = await RoomChat.create(
      {
        UserId: req.user.id,
        RoomId: roomId,
        content,
      },
      { transaction }
    );

    await transaction.commit();

    const chatWithUser = await RoomChat.findOne({
      where: { id: chat.id },
      include: [
        {
          model: User,
          attributes: ['id', 'nickname', 'image'],
        },
      ],
    });

    const io = req.app.get('io');
    // io.of('/ws-room').to(`/ws-room-${roomId}`).emit('chat', chatWithUser);
    io.of(`/ws-room-${roomId}`).emit('chat', chatWithUser);

    return res.status(200).json({ success: true, chat: chatWithUser });
  } catch (error) {
    console.error(error);
    transaction.rollback();
    next(error);
  }
});

router.post('/:roomId/test/chat', async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { roomId } = req.params;
    const { content } = req.body;

    const room = await Room.findOne({ where: { id: roomId } });
    if (!room) {
      return res.status(404).json({ success: false, message: STATUS_404_ROOM });
    }

    const chat = await RoomChat.create(
      {
        UserId: 1,
        RoomId: roomId,
        content,
      },
      { transaction }
    );

    await transaction.commit();

    const chatWithUser = await RoomChat.findOne({
      where: { id: chat.id },
      include: [
        {
          model: User,
          attributes: ['id', 'nickname', 'image'],
        },
      ],
    });

    const io = req.app.get('io');
    // io.of('/ws-room').to(`/ws-room-${roomId}`).emit('chat', chatWithUser);
    io.of(`/ws-room-${roomId}`).emit('chat', chatWithUser);

    return res.status(200).json({ success: true, chat: chatWithUser });
  } catch (error) {
    console.error(error);
    transaction.rollback();
    next(error);
  }
});

router.post('/:roomId/image', isLoggedIn, uploadGCS.array('image'), async (req, res, next) => {
  try {
    const { roomId } = req.params;

    const room = await Room.findOne({ where: { id: roomId } });
    if (!room) {
      return res.status(404).json({ success: false, message: STATUS_404_ROOM });
    }

    for (let i = 0; i < req.files.length; i++) {
      console.log('req.files[i].originalname', req.files[i].originalname);

      const blob = bucket.file(`uploads/${Date.now()}_${req.files[i].originalname.replace(' ', '_')}`);
      const blobStream = blob.createWriteStream();

      blobStream.on('error', (err) => {
        next(err);
      });

      blobStream.on('finish', async () => {
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
        console.log('publicUrl', publicUrl);

        const chat = await RoomChat.create({
          UserId: req.user.id,
          RoomId: roomId,
          content: publicUrl,
        });

        const chatWithUser = await RoomChat.findOne({
          where: { id: chat.id },
          include: [
            {
              model: User,
              attributes: ['id', 'nickname', 'image'],
            },
          ],
        });

        const io = req.app.get('io');
        // io.of('/ws-room').to(`/ws-room-${roomId}`).emit('chat', chatWithUser);
        io.of(`/ws-room-${roomId}`).emit('chat', chatWithUser);
      });

      blobStream.end(req.files[i].buffer);
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.post('/:roomId/test/image', uploadGCS.array('image'), async (req, res, next) => {
  try {
    const { roomId } = req.params;

    const room = await Room.findOne({ where: { id: roomId } });
    if (!room) {
      return res.status(404).json({ success: false, message: STATUS_404_ROOM });
    }

    for (let i = 0; i < req.files.length; i++) {
      console.log('req.files[i].originalname', req.files[i].originalname);

      const blob = bucket.file(`uploads/${Date.now()}_${req.files[i].originalname.replace(' ', '_')}`);
      const blobStream = blob.createWriteStream();

      blobStream.on('error', (err) => {
        next(err);
      });

      blobStream.on('finish', async () => {
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
        console.log('publicUrl', publicUrl);

        const chat = await RoomChat.create({
          UserId: 1,
          RoomId: roomId,
          content: publicUrl,
        });

        const chatWithUser = await RoomChat.findOne({
          where: { id: chat.id },
          include: [
            {
              model: User,
              attributes: ['id', 'nickname', 'image'],
            },
          ],
        });

        const io = req.app.get('io');
        // io.of('/ws-room').to(`/ws-room-${roomId}`).emit('chat', chatWithUser);
        io.of(`/ws-room-${roomId}`).emit('chat', chatWithUser);
      });

      blobStream.end(req.files[i].buffer);
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

/* 멤버 추가 라우터 */
router.post('/:roomId/member', isLoggedIn, async (req, res, next) => {
  try {
    const { roomId } = req.params;
    // 유저가 존재하는지 확인 => 방이 존재하는지 확인 =>
    const user = await User.findOne({ where: { id: req.user.id } });
    if (!user) {
      return res.status(404).json({ success: false, message: STATUS_404_USER });
    }

    const room = await Room.findOne({ where: { id: roomId } });
    if (!room) {
      return res.status(404).json({ success: false, message: STATUS_404_ROOM });
    }

    const roomMember = await RoomMember.findOne({ where: { UserId: req.user.id } });
    if (!roomMember) {
      await room.addMembers(req.user.id);
    } else {
      console.log(roomMember.RoomId, parseInt(roomId, 10));
      if (roomMember.RoomId !== parseInt(roomId, 10)) {
        return res.status(403).json({ success: false, message: STATUS_403_ROOMMEMBER });
      }
    }

    const io = req.app.get('io');
    io.of(`ws-room-${roomId}`).emit('enterMember', { user });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
