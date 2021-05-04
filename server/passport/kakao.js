const passport = require("passport");
const { Strategy: KakaoStrategy } = require("passport-kakao");
const { User } = require("../models");

module.exports = () => {
  passport.use(
    new KakaoStrategy(
      {
        clientID: process.env.KAKAO_ID,
        callbackURL: "/auth/kakao/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // authorization 에 성공했을 대의 액션
          console.log(profile);
          console.log(profile._json);
          const exUser = await User.findOne({
            where: { snsId: profile.id, provider: "kakao" },
          });
          if (exUser) {
            done(null, exUser);
          } else {
            const newUser = await User.create({
              email: profile._json && profile._json.kakao_account.email,
              nickname: profile.displayName,
              snsId: profile.id,
              image: profile._json.properties.profile_image,
              provider: "kakao",
            });
            done(null, newUser);
          }
        } catch (error) {
          console.error(error);
          return done(error);
        }
      }
    )
  );
};
