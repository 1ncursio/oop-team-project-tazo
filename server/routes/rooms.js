const express = require('express');
const { validationResult } = require('express-validator');
const router = express.Router();
const { sequelize, Room, User, RoomChat, RoomMember } = require('../models');
const { STATUS_403_ROOMMEMBER, STATUS_404_ROOM, STATUS_404_USER } = require('../utils/message');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const { uploadGCS, bucket } = require('../utils/upload');
const { createRoomValidator, enterQueueValidator } = require('../utils/validator');
const getDistanceFromLatLngInKm = require('../utils/getDistance');
const { Op } = require('sequelize');
let waitingQueue = require('../utils/waitingQueue');

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

router.get('/queue', (req, res, next) => {
  res.status(200).json(waitingQueue);
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
    return res.status(200).json(roomWithUser);
  } catch (error) {
    console.error(error);
    await transaction.rollback();
    next(error);
  }
});

/* 큐 퇴장 라우터 */
router.delete('/queue', isLoggedIn, enterQueueValidator, async (req, res, next) => {
  try {
    waitingQueue = waitingQueue.filter((v) => v.User.id !== req.user.id);
    console.log('유저가 퇴장했습니다', waitingQueue);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.delete('/:roomId', isLoggedIn, async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { roomId } = req.params;
    const room = await Room.findOne({ where: { id: roomId, OwnerId: req.user.id } });
    if (!room) {
      return res.status(404).json({ success: false, message: '방이 존재하지 않거나 권한이 없습니다.' });
    }
    await room.removeMembers(req.user.id, { transaction });
    await Room.destroy({ where: { id: roomId }, transaction });
    await transaction.commit();

    const io = req.app.get('io');
    io.of('/ws-room').emit('destroyRoom', room);
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    await transaction.rollback();
    next(error);
  }
});

/* 채팅 라우터 */

router.get('/:roomId/chat', isLoggedIn, async (req, res, next) => {
  try {
    const { roomId } = req.params;

    const room = await Room.findOne({ where: { id: roomId } });
    if (!room) {
      return res.status(404).json({ success: false, message: STATUS_404_ROOM });
    }
    // const roomMember = RoomMember.findOne({where: {id:roomId, }})
    res
      .status(200)
      .json(await room.getRoomChats({ include: [{ model: User, attributes: ['id', 'nickname', 'image'] }] }));
  } catch (error) {
    console.error(error);
    next(error);
  }
});

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
    await transaction.rollback();
    next(error);
  }
});

// router.post('/:roomId/test/chat', async (req, res, next) => {
//   const transaction = await sequelize.transaction();
//   try {
//     const { roomId } = req.params;
//     const { content } = req.body;

//     const room = await Room.findOne({ where: { id: roomId } });
//     if (!room) {
//       return res.status(404).json({ success: false, message: STATUS_404_ROOM });
//     }

//     const chat = await RoomChat.create(
//       {
//         UserId: 1,
//         RoomId: roomId,
//         content,
//       },
//       { transaction }
//     );

//     await transaction.commit();

//     const chatWithUser = await RoomChat.findOne({
//       where: { id: chat.id },
//       include: [
//         {
//           model: User,
//           attributes: ['id', 'nickname', 'image'],
//         },
//       ],
//     });

//     const io = req.app.get('io');
//     // io.of('/ws-room').to(`/ws-room-${roomId}`).emit('chat', chatWithUser);
//     io.of(`/ws-room-${roomId}`).emit('chat', chatWithUser);

//     return res.status(200).json({ success: true, chat: chatWithUser });
//   } catch (error) {
//     console.error(error);
//     await transaction.rollback();
//     next(error);
//   }
// });

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

// router.post('/:roomId/test/image', uploadGCS.array('image'), async (req, res, next) => {
//   try {
//     const { roomId } = req.params;

//     const room = await Room.findOne({ where: { id: roomId } });
//     if (!room) {
//       return res.status(404).json({ success: false, message: STATUS_404_ROOM });
//     }

//     for (let i = 0; i < req.files.length; i++) {
//       console.log('req.files[i].originalname', req.files[i].originalname);

//       const blob = bucket.file(`uploads/${Date.now()}_${req.files[i].originalname.replace(' ', '_')}`);
//       const blobStream = blob.createWriteStream();

//       blobStream.on('error', (err) => {
//         next(err);
//       });

//       blobStream.on('finish', async () => {
//         const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
//         console.log('publicUrl', publicUrl);

//         const chat = await RoomChat.create({
//           UserId: 1,
//           RoomId: roomId,
//           content: publicUrl,
//         });

//         const chatWithUser = await RoomChat.findOne({
//           where: { id: chat.id },
//           include: [
//             {
//               model: User,
//               attributes: ['id', 'nickname', 'image'],
//             },
//           ],
//         });

//         const io = req.app.get('io');
//         // io.of('/ws-room').to(`/ws-room-${roomId}`).emit('chat', chatWithUser);
//         io.of(`/ws-room-${roomId}`).emit('chat', chatWithUser);
//       });

//       blobStream.end(req.files[i].buffer);
//     }

//     return res.status(200).json({ success: true });
//   } catch (error) {
//     console.error(error);
//     next(error);
//   }
// });

/* 멤버 추가 라우터 */
router.post('/:roomId/member', isLoggedIn, async (req, res, next) => {
  try {
    const { roomId } = req.params;
    // 방이 존재하는지 확인

    const room = await Room.findOne({
      where: { id: roomId },
      include: {
        model: User,
        as: 'Members',
        attributes: ['id', 'nickname', 'image'],
      },
    });
    if (!room) {
      return res.status(404).json({ success: false, message: STATUS_404_ROOM });
    }

    if (room.Members.length === room.userLimit) {
      return res.status(403).json({ success: false, message: '방 인원이 모두 찼습니다.' });
    }

    if (room.gender !== 'none') {
      if (room.gender !== req.user.gender) {
        return res.status(403).json({ success: false, message: '해당 성별은 입장할 수 없습니다.' });
      }
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

    const user = await User.findOne({
      where: { id: req.user.id },
      attributes: ['id', 'nickname', 'image'],
    });

    const io = req.app.get('io');
    io.of(`ws-room-${roomId}`).emit('enterMember', user);

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// 멤버 퇴장 라우터
router.delete('/:roomId/member', isLoggedIn, async (req, res, next) => {
  try {
    const { roomId } = req.params;
    // 방이 존재하는지 확인

    const room = await Room.findOne({ where: { id: roomId } });
    if (!room) {
      return res.status(404).json({ success: false, message: STATUS_404_ROOM });
    }

    const roomMember = await RoomMember.findOne({ where: { UserId: req.user.id } });
    if (roomMember) {
      await room.removeMembers(req.user.id);
    } else {
      return res.status(403).json({ success: false, message: '아직 참여한 방이 없습니다.' });
    }

    const user = await User.findOne({
      where: { id: req.user.id },
      attributes: ['id', 'nickname', 'image'],
    });

    const io = req.app.get('io');
    io.of(`ws-room-${roomId}`).emit('leaveMember', user);

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

/* 방 대기열 라우터 */

// POST /rooms/queue
router.post('/queue', isLoggedIn, enterQueueValidator, async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const currentUser = {};
  console.log('입장 전 waitingQueue', waitingQueue);

  Object.keys(req.body).forEach((key) => {
    currentUser[key] = req.body[key];
  });

  const transaction = await sequelize.transaction();
  try {
    // Finds the validation errors in this request and wraps them in an object with handy functions

    const roomMember = await RoomMember.findOne({ where: { UserId: req.user.id } });
    if (roomMember) {
      return res.status(403).json({ success: false, message: STATUS_403_ROOMMEMBER });
    }

    /* 요청이 오면 유저가 큐에 있는지 확인
        이미 있으면 403, 없으면 통과
        유저가 2명 이상일 때 거리와 조건이 맞는지 분기 처리
        조건에 맞으면 큐에서 삭제하고 방을 파준다
        조건에 맞지 않으면 올때마다 처리
    */

    const { originLat, originLng, originName } = req.body;
    const isOriginYeoungJin = originName === '영진대';

    let exRoom;
    if (currentUser.gender === 'none') {
      // 유저의 gender
      exRoom = await Room.findAll({ where: { gender: { [Op.or]: ['none', req.user.gender] } } });
    } else {
      exRoom = await Room.findAll({ where: { gender: req.user.gender } });
    }

    if (exRoom) {
      /*
        출발지가 영진이면 각각의 도착지의 거리를 계산
        도착지가 영진이면 각각의 출발지의 거리를 계산
      */
      const exRoomsList = exRoom.map((v) => v.dataValues);
      for (let i = 0; i < exRoomsList.length; i++) {
        const distance = isOriginYeoungJin
          ? getDistanceFromLatLngInKm(
              parseFloat(exRoomsList[i].destinationLat),
              parseFloat(exRoomsList[i].destinationLng),
              parseFloat(currentUser.destinationLat),
              parseFloat(currentUser.destinationLng)
            )
          : getDistanceFromLatLngInKm(
              parseFloat(exRoomsList[i].originLat),
              parseFloat(exRoomsList[i].originLng),
              parseFloat(currentUser.originLat),
              parseFloat(currentUser.originLng)
            );
        if (distance <= 1) {
          await exRoom[i].addMembers(req.user.id);
          return res.status(200).json({ RoomId: exRoom[i].id });
        }
      }
    }

    // 기존에 방에 있으면 RoomId가 반환되고
    const user = await (
      await User.findOne({ where: { id: req.user.id }, attributes: ['id', 'nickname', 'image', 'gender'] })
    ).toJSON();

    // queue 에 참가한 유저인지 판별
    if (waitingQueue.some((waitingData) => waitingData.User.id === user.id)) {
      return res.status(403).json({ success: false, message: '이미 대기열에 참가한 유저입니다.' });
    }

    currentUser['User'] = user;
    const matchedUsers = [];

    waitingQueue.forEach((waitingData, index) => {
      // gender와 거리를 만족하는 유저들을 포함한 배열
      console.dir({
        waitingData,
        currentUser,
      });
      if (
        (waitingData.originName === '영진대' && currentUser.originName === '영진대') ||
        (waitingData.destinationName === '영진대' && currentUser.destinationName === '영진대')
      ) {
        /*
        출발지가 영진이면 각각의 도착지의 거리를 계산
        도착지가 영진이면 각각의 출발지의 거리를 계산
      */
        const distance = isOriginYeoungJin
          ? getDistanceFromLatLngInKm(
              parseFloat(waitingData.destinationLat),
              parseFloat(waitingData.destinationLng),
              parseFloat(currentUser.destinationLat),
              parseFloat(currentUser.destinationLng)
            )
          : getDistanceFromLatLngInKm(
              parseFloat(waitingData.originLat),
              parseFloat(waitingData.originLng),
              parseFloat(currentUser.originLat),
              parseFloat(currentUser.originLng)
            );
        console.log('distance', distance);

        /*
        조건을 만족하는 유저들을 matchedUsers 배열로 넘겨준다.
        공통조건 : 1키로 미만
        세부 조건 : none이면 none female male 매칭, male은 male 매칭, female은 female 매칭
      */
        if (distance <= 1) {
          switch (currentUser.gender) {
            case 'none':
              matchedUsers.push(waitingData);
              waitingQueue = waitingQueue.filter((v, i) => v.User.id !== waitingData.User.id);
              break;
            case 'male':
              if (waitingData.User.gender === 'male') {
                matchedUsers.push(waitingData);
                waitingQueue = waitingQueue.filter((v, i) => v.User.id !== waitingData.User.id);
              }
              break;
            case 'female':
              if (waitingData.User.gender === 'female') {
                matchedUsers.push(waitingData);
                waitingQueue = waitingQueue.filter((v, i) => v.User.id !== waitingData.User.id);
              }
              break;
            default:
              break;
          }
        }
      }
    });

    const io = req.app.get('io');

    if (matchedUsers.length !== 0) {
      /*  
        만약 매칭된 유저가 있다면
        자신도 matchedUsers 배열에 넣음
      */
      console.log('유저 매칭했따');
      matchedUsers.push(currentUser);
      console.log('matchedUsers', matchedUsers);

      const matchedUsersId = matchedUsers.map((matchedUser) => ({ id: matchedUser.User.id }));
      [
        {
          id: 1,
        },
        { id: 2 },
      ];
      const roomNameUsingGender =
        currentUser.gender === 'none' ? '아무나' : currentUser.gender === 'male' ? '남자만' : '여자만';

      const room = await Room.create(
        {
          name: `[빠른 매칭] ${roomNameUsingGender}~`,
          userLimit: 4,
          gender: currentUser.gender,
          originName: currentUser.originName,
          destinationName: currentUser.destinationName,
          OwnerId: req.user.id,
        },
        { transaction }
      );
      // await room.addMembers(req.user.id, { transaction });
      // matchedUsersId 의 배열에 있는 유저들을 방 유저로 추가
      await Promise.all(matchedUsersId.map((matchedUser) => room.addMembers(matchedUser.id, { transaction })));

      // const room = await Room.create(body, { transaction });
      // await room.addMembers(req.user.id, { transaction });
      await transaction.commit();

      io.of('/ws-queue').emit('enterUser', { RoomId: room.id, matchedUsersId });
    } else {
      waitingQueue.push(currentUser);
      await transaction.commit();
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    await transaction.rollback();
    next(error);
  }
});

module.exports = router;
