const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { User } = require('../models');
const { STATUS_404_USER } = require('../utils/message');
const { isLoggedIn } = require('./middlewares');

const { upload, uploadGoogleStorage } = require('../utils/upload');

// POST /user/image
router.post('/image', isLoggedIn, uploadGoogleStorage.single('image'), async (req, res, next) => {
  res.json(req.file.filename);
});

// PATCH /user/image
router.patch('/image', isLoggedIn, async (req, res, next) => {
  try {
    const { image } = req.body;

    await User.update(
      {
        image,
      },
      { where: { id: req.user.id } }
    );

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    next(error); // status 500
  }
});

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

router.get('/', async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { id: req.user.id } });
    if (!user) {
      return res.status(404).json({ success: false, message: STATUS_404_USER });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
