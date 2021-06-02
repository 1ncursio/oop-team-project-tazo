const { body, oneOf } = require('express-validator');

const createRoomValidator = [
  body('name')
    .exists()
    .withMessage('name 프로퍼티가 존재하지 않습니다.')
    .bail()
    .notEmpty()
    .withMessage('name이 비어있습니다.')
    .bail()
    .isString()
    .withMessage('name이 문자열이 아닙니다.'),
  body('userLimit')
    .exists()
    .withMessage('userLimit 프로퍼티가 존재하지 않습니다.')
    .notEmpty()
    .withMessage('userLimit 이 비어있습니다.')
    .isInt({ min: 2, max: 4 })
    .withMessage('userLimit 은 2이상 4이하의 정수만 가능합니다.'),
  body('gender')
    .exists()
    .withMessage('gender 프로퍼티가 존재하지 않습니다.')
    .notEmpty()
    .isIn(['male', 'female', 'none']),
  body('startAt').exists().notEmpty().isISO8601().withMessage('startAt 값의 형식이 올바르지 않습니다.'),
  oneOf([
    [body('originLat').exists().notEmpty().isDecimal(), body('originLng').exists().notEmpty().isDecimal()],
    [body('destinationLat').exists().notEmpty().isDecimal(), body('destinationLng').exists().notEmpty().isDecimal()],
  ]),
];

module.exports = { createRoomValidator };
