const express = require('express');
const router = express.Router();
const path = require('path');
const { User } = require('../models');
const { STATUS_404_USER, STATUS_403_EMAIL } = require('../utils/message');
const { isLoggedIn } = require('./middlewares');

const { uploadGCS, bucket } = require('../utils/upload');

// PATCH /user/image
router.patch('/image', isLoggedIn, uploadGCS.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: '이미지가 업로드되지 않았습니다.' });
    }

    const blob = bucket.file(`uploads/${Date.now()}_${req.file.originalname.replace(' ', '_')}`);
    const blobStream = blob.createWriteStream();

    blobStream.on('error', (err) => {
      next(err);
    });

    blobStream.on('finish', async () => {
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;

      await User.update(
        {
          image: publicUrl,
        },
        { where: { id: req.user.id } }
      );

      res.status(200).json({ success: true, image: publicUrl });
    });

    blobStream.end(req.file.buffer);
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

// PATCH /user/test/nickname
router.patch('/test/nickname', async (req, res, next) => {
  try {
    const { nickname } = req.body;

    await User.update(
      {
        nickname,
      },
      { where: { id: 1 } }
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

// 이메일 중복 검사 라우터
router.get('/email/:email', async (req, res, next) => {
  try {
    const { email } = req.params;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ success: true, message: STATUS_404_USER });
    } else {
      return res.status(403).json({ success: true, message: STATUS_403_EMAIL });
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
