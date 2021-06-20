const express = require('express');
const app = express();

const session = require('express-session');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const passportConfig = require('./passport');
const fs = require('fs');
const path = require('path');

// 로깅
const createError = require('http-errors');
const morgan = require('morgan');
const { stream, logger } = require('./config/winston');
const dayjs = require('dayjs');
require('dayjs/locale/ko');

dayjs.locale('ko');

require('dotenv').config();
const cors = require('cors');
const redis = require('redis');
const RedisStore = require('connect-redis')(session);
const hpp = require('hpp');
const helmet = require('helmet');
const db = require('./models');

// 어드민
const AdminBro = require('admin-bro');
const AdminBroExpress = require('@admin-bro/express');
const AdminBroSequelize = require('@admin-bro/sequelize');

AdminBro.registerAdapter(AdminBroSequelize);

const adminBro = new AdminBro({
  databases: [db],
  rootPath: '/admin',
});

const userRouter = require('./routes/user');
const authRouter = require('./routes/auth');
const postRouter = require('./routes/post');
const postsRouter = require('./routes/posts');
const roomsRouter = require('./routes/rooms');

const webSocket = require('./socket');

app.set('PORT', process.env.PORT || 80);

const isProduction = process.env.NODE_ENV === 'production';

const redisClient = redis.createClient({
  url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
  password: process.env.REDIS_PASSWORD,
});

db.sequelize
  .sync({ alter: true })
  .then(() => {
    console.log('MYSQL 연결 성공');
  })
  .catch(console.error);
passportConfig();

if (isProduction) {
  app.set('trust proxy', 1);
  app.use(morgan('combined', { stream }));
  app.use(hpp());
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
          styleSrc: ["'self'", 'https:', "'unsafe-inline'"],
          baseUri: ["'self'"],
          fontSrc: ["'self'", 'https:', 'data:'],
        },
      },
    })
  );
  app.use(
    cors({
      origin: true,
      credentials: true,
    })
  );
} else {
  app.use(morgan('combined', { stream }));
  app.use(
    cors({
      origin: true,
      credentials: true,
    })
  );
}

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
const ADMIN = {
  email: process.env.ADMINBRO_EMAIL,
  password: process.env.ADMINBRO_PASSWORD,
};
// const router = AdminBroExpress.buildAuthenticatedRouter(adminBro, {
//   authenticate: async (email, password) => {
//     if (email === ADMIN.email && password === ADMIN.password) {
//       return ADMIN;
//     }
//     return null;
//   },
//   cookieName: 'adminbro',
//   cookiePassword: 'somePassword',
// });

const router = AdminBroExpress.buildRouter(adminBro);

app.use(adminBro.options.rootPath, router);
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
app.use('/auth', authRouter);
app.use('/post', postRouter);
app.use('/posts', postsRouter);
app.use('/rooms', roomsRouter);

// // catch 404 and forward to error handler
// app.use((req, res, next) => {
//   next(createError(404));
// });

// error handler
app.use((err, req, res, next) => {
  let apiError = err;

  if (!err.status) {
    apiError = createError(err);
  }

  const errObj = {
    req: {
      headers: req.headers,
      query: req.query,
      body: req.body,
      route: req.route,
    },
    error: {
      message: apiError.message,
      stack: apiError.stack,
      status: apiError.status,
    },
    user: req.user,
  };

  if (isProduction) {
    logger.error(dayjs().format('YYYY-MM-DD HH:mm:ss'), errObj);
  } else {
    res.locals.message = apiError.message;
    res.locals.error = apiError;
  }

  // render the error page
  return res.status(apiError.status).json(errObj);
});

const server = app.listen(app.get('PORT'), () => {
  console.log(`server listening at ${app.get('PORT')} port...`);
});

webSocket(server, app);
