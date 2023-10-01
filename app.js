require('dotenv').config();
const helmet = require('helmet');
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookies = require('cookie-parser');
const { errors } = require('celebrate');
const cors = require('cors');

const { PORT = 3000, BD_LINK } = process.env;
const app = express();

const routes = require('./routes/index');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const { createUser, login } = require('./controllers/users');
const { authentiacateUser } = require('./middlewares/auth');
const { validateCreateUser, validateUserLogin } = require('./middlewares/validation');
const NotFoundError = require('./utils/errors/not-found-error');
const { errorHandler } = require('./utils/errors/errorHandler');

app.use(helmet());
app.use(bodyParser.json());
app.use(cookies());
// app.use(cors({ origin: 'https://mesto-react-app.nomoreparties.co', credentials: true }));
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

mongoose.connect(BD_LINK, { useNewUrlParser: true, useUnifiedTopology: false }).then(() => {
  console.log('БД подключена');
});
app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Сервер сейчас упадёт');
  }, 0);
});
app.use(requestLogger);
app.post('/register', validateCreateUser, createUser);
app.post('/login', validateUserLogin, login);
app.get('/signout', (req, res) => {
  res.clearCookie('jwt').send({ message: 'Выход' });
});
app.use('/users', authentiacateUser, routes);
app.use('/movies', authentiacateUser, routes);
app.use(errorLogger);
app.use(authentiacateUser, (_req, _res, next) => next(new NotFoundError('Cтраница не найдена')));
app.use(errors());
app.use(errorHandler);
app.listen(PORT, () => {
  console.log('Бэк работает');
});
