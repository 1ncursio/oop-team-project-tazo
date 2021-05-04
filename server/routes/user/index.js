const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { User } = require("../../models");
const { isNotLoggedIn } = require("../middlewares");

// POST /user
router.post("/", isNotLoggedIn, async (req, res, next) => {
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

module.exports = router;
