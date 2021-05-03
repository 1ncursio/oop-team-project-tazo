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
const hpp = require('hpp');
const helmet = require('helmet');

const userRouter = require('./routes/user');
const authRouter = require('./routes/auth');

const db = require('./models');

const isProduction = process.env.NODE_ENV === 'production';

dotenv.config();

db.sequelize
  .sync({ alter: true })
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
      origin: false,
      credentials: true,
    })
  );
} else {
  app.use(morgan('dev'));
  app.use(
    cors({
      origin: 'http://localhost:7000',
      credentials: true,
    })
  );
}

app.use('/', express.static(path.join(__dirname, 'uploads')));
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
      domain: isProduction && '.test.domain',
    },
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

app.listen(process.env.PORT, () => {
  console.log(`server listening at ${process.env.PORT} port...`);
});
