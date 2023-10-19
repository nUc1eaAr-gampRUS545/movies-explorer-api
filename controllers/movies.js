const Movie = require('../models/movies');

const NotFoundError = require('../utils/errors/not-found-error');
const ErrorBadRequest = require('../utils/errors/invalid-request');


function getMovies(req, res, next) {
  return Movie.find({ owner: req.user.payload })
    .then((data) => {
      res.status(200).send(data);
    })
    .catch(next);
}

function createMovie(req, res, next) {
  const owner = req.user.payload;
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    thumbnail,
    movieId,
    nameRU,
    nameEN,
  } = req.body;
  Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    thumbnail,
    owner,
    movieId,
    nameRU,
    nameEN,
  })
    .then((data) => {
      res.status(201).send(data);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new ErrorBadRequest('Неверное тело запроса'));
      } else {
        next(err);
      }
    });
}

function deleteMovie(req, res, next) {
  return Movie.findById(req.params.movieId)
    .orFail(() => new NotFoundError('Карточка по данному id не найдена'))
    .then((movie) => movie.deleteOne())
    .catch(next);
}

module.exports = {
  getMovies,
  createMovie,
  deleteMovie,
};
