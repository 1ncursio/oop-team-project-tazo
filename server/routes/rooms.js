const express = require('express');
const router = express.Router();
const { sequelize, Room, RoomMember } = require('../models');
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
  const transaction = sequelize.transaction();
  try {
    const room = await Room.create({ name, OwnerId: req.user.id }, { transaction });
    // RoomMember.create()
    transaction.commit();
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
