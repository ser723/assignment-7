/**
 * Joke Router Factory
 * Creates and returns the Express Router configured with joke-related routes.
 *
 * @param {object} jokeController - The JokeController interface (created by jokeControllerFactory).
 * @returns {object} The configured Express Router.
 */
const express = require('express');

// The factory function receives the fully configured jokeController object
function jokeRouterFactory(jokeController) {
    const router = express.Router();

    // --- Joke Routes ---
    
    // GET /jokebook/categories - Get all categories
    router.get('/categories', jokeController.getCategories);

    // GET /jokebook/categories/:id - Get jokes for a specific category ID
    router.get('/categories/:id', jokeController.getJokesByCategoryId);

    // GET /jokebook/random - Get a random joke
    router.get('/random', jokeController.getRandomJoke);

    // POST /jokebook/jokes - Add a new joke
    router.post('/jokes', jokeController.addJoke);

    // PUT /jokebook/:id - Update a joke
    router.put('/:id', jokeController.updateJoke);

    // DELETE /jokebook/:id - Delete a joke
    router.delete('/:id', jokeController.deleteJoke);

    // --- Error Handling Route ---
    // This route will catch any requests to /jokebook that did not match
    router.use((req, res, next) => {
        res.status(404).json({ error: 'Joke resource not found' });
    });

    return router;
}

module.exports = jokeRouterFactory;