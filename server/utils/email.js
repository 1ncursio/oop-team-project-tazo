const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

const smtpTransport = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: process.env.NODEMAILER_USER,
    pass: process.env.NODEMAILER_PASS,
  },
  //   tls: {
  //     rejectUnauthorized: false,
  //   },
});

const emailTemplate = (token) =>
  `<div>
     <h2>타조 이메일 인증 메일</h2>
     <p>타조를 이용해주셔서 감사합니다. 아래의 인증번호를 입력하세요.</p>
     <p>${token}</p>
  </div>`;

module.exports = {
  smtpTransport,
  emailTemplate,
};
