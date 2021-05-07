const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { User } = require('../models');
const { isLoggedIn } = require('./middlewares');

// GET /users/:nickname
router.get('/:nickname', async (req, res, next) => {
  try {
    const { nickname } = req.params;
    if (parseInt(req.query.lastId, 10)) {
      // 초기 로딩이 아닐 때
      where.id = { [Op.lt]: parseInt(req.query.lastId, 10) }; //보다 작은
    }
    const users = await User.findAll({
      where: { nickname },
      limit: 12,
      attributes: {
        exclude: ['password', 'provider', 'snsId', 'status', 'gender', 'role', 'createdAt', 'updatedAt'],
      },
      //   order: [
      //     ['createdAt', 'DESC'],
      //     [Comment, 'createdAt', 'DESC'],
      //   ],
    });
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
