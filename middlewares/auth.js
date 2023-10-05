const JWT = require('jsonwebtoken');
const Unauthorized = require('../utils/errors/unauthorized');

const { NODE_ENV, JWT_SECRET } = process.env;
function authentiacateUser(req, _res, next) {
  const token = req.cookies.jwt;
  if (!token) {
    next(new Unauthorized('Пользователь не авторезирован'));
  }
  let payload;
  try {
    payload = JWT.verify(token, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret');
  } catch (err) {
    next(new Unauthorized('Необходима авторизация'));
  }
  req.user = payload;
  next();
}
module.exports = { authentiacateUser };
