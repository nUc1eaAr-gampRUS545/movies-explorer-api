const routes = require('express').Router();
const {
  updateUser, getUserInfo,
} = require('../controllers/users');
const {
  validateMoviePost, validateMovieId, validateUserUpdate,
} = require('../middlewares/validation');
const {
  getMovies,
  createMovie,
  deleteMovie,
} = require('../controllers/movies');

routes.get('/', getMovies);
routes.post('/', validateMoviePost, createMovie);
routes.delete('/:movieId', validateMovieId, deleteMovie);
routes.get('/me', getUserInfo);
routes.patch('/me', validateUserUpdate, updateUser);

module.exports = routes;
