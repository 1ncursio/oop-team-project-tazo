const express = require('express');
const router = express.Router();
const { User } = require('../models');
const { isLoggedIn } = require('./middlewares');

const queue = [];

//
router.post('/rooms', isLoggedIn, async (req, res, next) => {
  try {
    /* 요청이 오면 유저가 큐에 있는지 확인
        이미 있으면 403, 없으면 통과
        유저가 2명 이상일 때 거리와 조건이 맞는지 분기 처리
        조건에 맞으면 큐에서 삭제하고 방을 파준다
        조건에 맞지 않으면 올때마다 처리
      */
    const user = User.findOne({ where: { id: req.user.id } });
    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
