const messages = {
  // 401 UNAUTHORISED
  STATUS_401_AUTH: '로그인이 필요합니다.',

  // 403 FORBIDDEN
  STATUS_403_EMAIL: '이미 사용 중인 이메일입니다.',
  STATUS_403_AUTH: '로그인하지 않은 사용자만 접근 가능합니다.',
  STATUS_403_ADMIN: '관리자만 접근할 수 있습니다',

  // 404 NOT FOUND
  STATUS_404_USER: '존재하지 않는 유저입니다.',
  STATUS_404_POST: '존재하지 않는 게시글입니다.',
  STATUS_404_COMMENT: '존재하지 않는 댓글입니다.',
  STATUS_404_ROOM: '존재하지 않는 방입니다.',
};

module.exports = messages;
