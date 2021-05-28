const express = require('express');
const app = express();

const session = require('express-session');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const passportConfig = require('./passport');
const path = require('path');
const morgan = require('morgan');
const dotenv = require('dotenv');
const cors = require('cors');
const redis = require('redis');
const RedisStore = require('connect-redis')(session);
const hpp = require('hpp');
const helmet = require('helmet');

const userRouter = require('./routes/user');
const usersRouter = require('./routes/users');
const authRouter = require('./routes/auth');
const postRouter = require('./routes/post');
const postsRouter = require('./routes/posts');
const roomsRouter = require('./routes/rooms');

const db = require('./models');

const webSocket = require('./socket');

app.set('PORT', process.env.PORT || 80);

const isProduction = process.env.NODE_ENV === 'production';

dotenv.config();
const redisClient = redis.createClient({
  url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
  password: process.env.REDIS_PASSWORD,
});

db.sequelize
  .sync()
  .then(() => {
    console.log('MYSQL 연결 성공');
  })
  .catch(console.error);
passportConfig();

if (isProduction) {
  app.set('trust proxy', 1);
  app.use(morgan('combined'));
  app.use(hpp());
  app.use(helmet());
  app.use(
    cors({
      origin: true,
      credentials: true,
    })
  );
} else {
  app.use(morgan('dev'));
  app.use(
    cors({
      origin: true,
      credentials: true,
    })
  );
}

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(
  session({
    saveUninitialized: true,
    resave: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
      httpOnly: true,
      secure: isProduction,
      domain: isProduction && '.tazoapp.site',
    },
    store: new RedisStore({ client: redisClient }),
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) => {
  res.status(200).json({ success: true, message: 'BACKEND TEST' });
});

app.get('/oauth', passport.authenticate('kakao'), (req, res) => {
  res.send(`id: ${req.user.profile.id} / accessToken : ${req.user.accessToken}`);
});

app.use('/user', userRouter);
app.use('/users', usersRouter);
app.use('/auth', authRouter);
app.use('/post', postRouter);
app.use('/posts', postsRouter);
app.use('/rooms', roomsRouter);

const server = app.listen(app.get('PORT'), () => {
  console.log(`server listening at ${app.get('PORT')} port...`);
});

webSocket(server, app);
