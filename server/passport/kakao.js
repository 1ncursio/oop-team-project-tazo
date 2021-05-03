const passport = require('passport');
const { Strategy: KakaoStrategy } = require('passport-kakao');
const { User } = require('../models');

module.exports = () => {
  try {
    passport.use(
      new KakaoStrategy(
        {
          clientID: process.env.KAKAO_ID,
          callbackURL: 'http://localhost:7005/oauth',
        },
        async (accessToken, refreshToken, profile, done) => {
          // authorization 에 성공했을 대의 액션
          console.log(`accessToken : ${accessToken}`);
          console.log(`사용자 profile : ${JSON.stringify(profile._json)}`);
          const user = {
            profile: profile._json,
            accessToken,
          };
          return done(null, user);
          //   const user = await User.create({
          //     profile: profile_json,
          //   });
          //   const user = await User.findOne({
          //     where: { email },
          //   });
          //   if (!user) {
          //     return done(null, false, { reason: '존재하지 않는 사용자입니다.' });
          //   }
          //   const result = await bcrypt.compare(password, user.password);
          //   if (result) {
          //     return done(null, user);
          //   }
          //   return done(null, false, { reason: '비밀번호가 틀렸습니다.' });
        }
      )
    );
  } catch (error) {
    console.error(error);
    return done(error);
  }
};
