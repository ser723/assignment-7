//jokeRouter.js
const express = require('express');
const jokeModelFactory = require('../models/jokeModel');
const jokeControllerFactory = require('../controllers/jokeController');


const jokeRouter = (pool) => {
    // 1. Initialize the Model with the database pool
    const jokeModel = jokeModelFactory(pool);

    // 2. Initialize the Controller with the Model
    const jokeController = jokeControllerFactory(jokeModel);
    
    // 3. Create the router instance
    const router = express.Router();

    // Route to get all categories: GET /jokebook/categories
    router.get('/categories', jokeController.getAllCategories);

    // Route to get jokes by category: GET /jokebook/category/:category
    router.get('/category/:category', jokeController.getJokesByCategory);

    // Route to add a new joke: POST /jokebook/add
    router.post('/add', jokeController.addJoke);

    return router;
};

module.exports = jokeRouter;