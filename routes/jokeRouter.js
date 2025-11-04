const { Router } = require('express');

/**
 * Joke Router Factory
 * Creates and returns an Express Router configured with joke routes.
 *
 * This router is configured to match the updated controller/model logic:
 * 1. GET /categories fetches all categories.
 * 2. GET /categories/:id fetches jokes using the numeric category ID.
 *
 * @param {object} jokeController - The JokeController interface.
 * @returns {express.Router} Configured Express Router.
 */
const jokeRouterFactory = (jokeController) => {
    // We use the Router constructor provided by the Express module.
    const router = Router();

    // GET /jokebook/categories - Get all categories
    // Maps to jokeController.getCategories
    router.get('/categories', jokeController.getCategories);

    // GET /jokebook/categories/:id - Get jokes by a specific category ID
    // The ':id' parameter will contain the numeric category_id.
    // This maps to jokeController.getJokesByCategoryId
    router.get('/categories/:id', jokeController.getJokesByCategoryId);

    // POST /jokebook/jokes - Add a new joke
    // Maps to jokeController.addJoke
    router.post('/jokes', jokeController.addJoke);

    return router;
};

module.exports = jokeRouterFactory;