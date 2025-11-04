//jokeRouter.js
const express = require('express');
const router = express.Router();

//Import all controller functions from jokeController.js
const jokeController = require('../controllers/jokeController');

//Joke Book API Routes

//GET /jokebook/categories responds with all unique joke categories
router.get('/categories', jokeController.getAllCategories);

//GET /jokebook/category/ :category query param ?limit=X
router.get('/category/:category', jokeController.getJokesByCategory);

//GET /jokebook/random responds with a single random joke
router.get('/random', jokeController.getRandomJoke);

//POST /jokebook/joke/add adds a new joke to the database
router.post('/joke/add', jokeController.addJoke);

module.exports = router;
