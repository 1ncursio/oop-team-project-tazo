const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { User } = require('../models');
const { isLoggedIn } = require('./middlewares');

// PATCH /user/profile
router.patch('/profile', isLoggedIn, async (req, res, next) => {
  try {
    const { nickname, introduction } = req.body;

    await User.update(
      {
        nickname,
        introduction,
      },
      { where: { id: req.user.id } }
    );

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    next(error); // status 500
  }
});

module.exports = router;
