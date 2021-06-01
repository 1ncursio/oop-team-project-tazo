const { body, oneOf } = require('express-validator');

const createRoomValidator = [
  body('name').exists().withMessage('name 프로퍼티가 존재하지 않습니다.').notEmpty().isString(),
  body('userLimit').exists().notEmpty().isInt({ min: 2, max: 4 }),
  body('gender').exists().withMessage('gender 프로퍼티가 존재하지 않습니다.').notEmpty().isIn('male', 'female', 'none'),
  body('startAt').exists().notEmpty().isDate(),
  oneOf([
    [body('originLat').exists().notEmpty().isDecimal(), body('originLng').exists().notEmpty().isDecimal()],
    [body('destinationLat').exists().notEmpty().isDecimal(), body('destinationLng').exists().notEmpty().isDecimal()],
  ]),
];

module.exports = { createRoomValidator };
