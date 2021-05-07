const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { User } = require('../models');
const { isLoggedIn } = require('./middlewares');

const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, done) {
      done(null, 'uploads');
    },
    filename(req, file, done) {
      // 제로초.png
      // const ext = path.extname(file.originalname); // 확장자 추출(.png)
      // const basename = path.basename(file.originalname, ext); // 제로초
      done(null, `${Date.now()}_${path.basename(file.originalname)}`); // 제로초_15184712891.png
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// POST /user/image
router.post('/image', isLoggedIn, upload.single('image'), async (req, res, next) => {
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

module.exports = router;
