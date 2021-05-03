const express = require('express');
const router = express.Router();
const passport = require('passport');
const { isLoggedIn } = require('./middlewares');

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
