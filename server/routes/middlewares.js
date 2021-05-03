exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.status(401).json({ success: false, message: '로그인이 필요합니다.' });
  }
};

exports.isNotLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    next();
  } else {
    res.status(401).json({ success: false, message: '로그인하지 않은 사용자만 접근 가능합니다.' });
  }
};

exports.isAdmin = (req, res, next) => {
  if (req.user.role === 2) {
    next();
  } else {
    res.status(401).json({ success: false, message: '권한이 없습니다.' });
  }
};
