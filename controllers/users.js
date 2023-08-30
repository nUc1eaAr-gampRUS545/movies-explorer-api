/* eslint-disable import/no-extraneous-dependencies */
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { NODE_ENV, JWT_SECRET } = process.env;
const NotFoundError = require('../utils/errors/not-found-error');

const userSchema = require('../models/users');
const ErrorBadRequest = require('../utils/errors/invalid-request');
// const IntervalServerError = require('../utils/errors/IntervalServerError');
const Unauthorized = require('../utils/errors/unauthorized');
const ConflictError = require('../utils/errors/ConflictError');

function createUser(req, res, next) {
  const {
    email, password, name,
  } = req.body;
  bcrypt.hash(password, 10)
    .then((hash) => userSchema.create({
      email,
      password: hash,
      name,
    }).then((user) => res.send({
      name: user.name, email: user.email,
    })))
    .catch((err) => {
      if (err.code === 11000) {
        next(new ConflictError('Пользователь с таким email уже существует'));
      } else if (err.name === 'ValidationError') {
        next(new ErrorBadRequest(err));
      } else {
        next(err);
      }
    });
}
function login(req, res, next) {
  const { email, password } = req.body;
  userSchema.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        return next(new Unauthorized('Неправильные почта или пароль'));
      }
      return bcrypt.compare(password, user.password)
        .then((result) => {
          if (!result) {
            return next(new Unauthorized('Неправильные почта или пароль'));
          }
          const token = jwt.sign(
            { payload: user._id },
            NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret',
          );
          res
            .cookie('jwt', token, {
              maxage: 3600000 * 24 * 7,
              httpOnly: true,
            }).json({ message: 'Успешная авторизация.' });
        })
        .catch((err) => {
          next(err);
        });
    })
    .catch((err) => {
      next(err);
    });
}
function getUserInfo(req, res, next) {
  userSchema.findById(req.user.payload)
    .orFail(new NotFoundError('Пользователь не найден'))
    .then((user) => {
      res.status(200).send(user);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new ErrorBadRequest('Ошибка данных'));
      } else {
        next(err);
      }
    });
}

function updateUser(req, res, next) {
  const { name, about } = req.body;
  userSchema.findByIdAndUpdate(
    req.user.payload,
    { name, about },
    { new: true, runValidators: true },
  )
    .then((data) => {
      if (!data) {
        next(new NotFoundError('Пользователь по указанному id не найден.'));
      } else {
        res.status(200).send(data);
      }
    })
    .catch((data) => {
      if (data.name === 'ValidationError') {
        next(new ErrorBadRequest('ValidationError'));
      } else {
        next(data);
      }
    });
}

module.exports = {
  updateUser,
  login,
  createUser,
  getUserInfo,
};
