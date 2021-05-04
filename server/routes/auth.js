const express = require('express');
const router = express.Router();
const passport = require('passport');
const { User } = require('../models');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');

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
      const user = await User.findOne({
        where: { id: user.id },
        attributes: {
          exclude: ['password'],
        },
      });
      return res.status(200).json(user);
    });
  })(req, res, next);
});

router.get('/logout', isLoggedIn, (req, res) => {
  req.logOut();
  req.session.destroy();

  return res.status(200).json({ success: true });
});

router.get('/kakao', passport.authenticate('kakao'));

router.get('/kakao/callback', passport.authenticate('kakao', { failureRedirect: '/' }), (req, res) => {
  res.status(200).json({ success: true, user: req.user });
  res.redirect('/');
});

module.exports = router;
