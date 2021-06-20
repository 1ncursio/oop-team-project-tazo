const express = require('express');
const router = express.Router();
const passport = require('passport');
const bcrypt = require('bcrypt');
const { User } = require('../models');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const { STATUS_403_EMAIL } = require('../utils/message');
const generateRandomNumber = require('../utils/generateRandomNumber');
const { smtpTransport, emailTemplate } = require('../utils/email');

// GET /auth
router.get('/', async (req, res, next) => {
  try {
    if (req.user) {
      const user = await User.findOne({
        where: { id: req.user.id },
        attributes: {
          exclude: ['password', 'token'],
        },
      });
      res.status(200).json(user);
    } else {
      res.status(200).json(null);
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// POST /auth/signup
router.post('/signup', isNotLoggedIn, async (req, res, next) => {
  try {
    const { email, nickname, gender, password } = req.body;

    if (email.split('@')[1] !== 'g.yju.ac.kr') {
      return res
        .status(403)
        .json({ success: false, message: '영진전문대 구글 G Suite 이메일로만 가입하실 수 있습니다.' });
    }

    const exUser = await User.findOne({ where: { email } });
    if (exUser) {
      return res.status(403).json({ success: false, message: STATUS_403_EMAIL });
    }
    const hashedPassword = await bcrypt.hash(password, 5);

    const randomToken = generateRandomNumber();

    await User.create({
      email,
      nickname,
      gender,
      password: hashedPassword,
      token: randomToken,
    });

    await smtpTransport.sendMail({
      from: process.env.NODEMAILER_USER,
      to: email,
      subject: '[타조] 이메일 인증을 완료해주세요.',
      html: emailTemplate(randomToken),
    });

    return res.status(201).json({ success: true });
  } catch (error) {
    console.error(error);
    next(error); // status 500
  }
});

// PATCH /auth/email
router.patch('/email', async (req, res, next) => {
  try {
    const { email, token } = req.body;

    const user = await User.findOne({ where: { email, token, status: 0 } });

    if (!user) {
      return res
        .status(403)
        .json({ success: false, message: '유효하지 않은 인증번호이거나 이미 인증된 이메일입니다.' });
    }

    await User.update(
      {
        status: 1, // authenticated
      },
      { where: { email } }
    );

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    next(error); // status 500
  }
});

// POST /auth/login
router.post('/login', isNotLoggedIn, (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      console.log(err);
      return next(err);
    }
    if (info) {
      return res.status(401).json({ success: false, message: info.reason });
    }
    return req.logIn(user, async (loginErr) => {
      if (loginErr) {
        console.error(loginErr);
        return next(loginErr);
      }
      const passwordExcludedUser = await User.findOne({
        where: { id: user.id },
        attributes: {
          exclude: ['password', 'token'],
        },
      });
      return res.status(200).json(passwordExcludedUser);
    });
  })(req, res, next);
});

// POST /auth/logout
router.get('/logout', isLoggedIn, (req, res) => {
  req.logOut();
  req.session.destroy();

  return res.status(200).json({ success: true });
});

router.get('/kakao', passport.authenticate('kakao'));

router.get(
  '/kakao/callback',
  passport.authenticate('kakao', { failureRedirect: 'http://localhost:7000' }),
  (req, res) => {
    // res.status(200).json({ success: true, user: req.user });
    res.redirect('http://localhost:7000');
  }
);

module.exports = router;
