const express = require("express");
const router = express.Router();
const passport = require("passport");
const bcrypt = require("bcrypt");
const { User } = require("../models");
const { isLoggedIn, isNotLoggedIn } = require("./middlewares");

// GET /auth
router.get("/", async (req, res, next) => {
  try {
    if (req.user) {
      const user = await User.findOne({
        where: { id: req.user.id },
        attributes: {
          exclude: ["password"],
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
router.post("/signup", isNotLoggedIn, async (req, res, next) => {
  try {
    const { email, nickname, password } = req.body;
    const exUser = await User.findOne({ where: { email } });
    if (exUser) {
      return res
        .status(403)
        .json({ success: false, message: "이미 사용 중인 이메일입니다." });
    }
    const hashedPassword = await bcrypt.hash(password, 11);

    await User.create({
      email,
      nickname,
      password: hashedPassword,
    });

    return res.status(201).json({ success: true });
  } catch (error) {
    console.error(error);
    next(error); // status 500
  }
});

// POST /auth/login
router.post("/login", isNotLoggedIn, (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
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
          exclude: ["password"],
        },
      });
      return res.status(200).json(passwordExcludedUser);
    });
  })(req, res, next);
});

// POST /auth/logout
router.get("/logout", isLoggedIn, (req, res) => {
  req.logOut();
  req.session.destroy();

  return res.status(200).json({ success: true });
});

router.get("/kakao", passport.authenticate("kakao"));

router.get(
  "/kakao/callback",
  passport.authenticate("kakao", { failureRedirect: "http://localhost:7000" }),
  (req, res) => {
    // res.status(200).json({ success: true, user: req.user });
    res.redirect("http://localhost:7000");
  }
);

module.exports = router;
