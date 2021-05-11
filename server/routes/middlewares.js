const { STATUS_401_AUTH, STATUS_403_AUTH, STATUS_403_ADMIN } = require('../utils/message');

exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.status(401).json({ success: false, message: STATUS_401_AUTH });
  }
};

exports.isNotLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    next();
  } else {
    res.status(403).json({ success: false, message: STATUS_403_AUTH });
  }
};

exports.isAdmin = (req, res, next) => {
  if (req.user.role === 2) {
    next();
  } else {
    res.status(401).json({ success: false, message: STATUS_403_ADMIN });
  }
};
