/**
 * Joke Router Factory
 * Creates and returns the Express router configured with joke-related routes.
 *
 * This router is configured to handle the '/jokebook' endpoint, and delegates
 * specific requests to the methods provided by the JokeController.
 *
 * @param {object} jokeController - The JokeController interface (created by jokeControllerFactory).
 * @returns {object} The configured Express Router.
 */
const express = require('express');
const router = express.Router();

function jokeRouterFactory(jokeController) {
    
    // --- Joke Routes ---
    // GET /jokebook/categories - Get all categories
    router.get('/categories', jokeController.getCategories);

    // GET /jokebook/categories/:id - Get jokes for a specific category ID
    router.get('/:id', jokeController.getJokeById);

    // GET /jokebook/random - Get a random joke (Added to support the frontend demo)
    router.get('/random', jokeController.getRandomJoke); 

    // POST /jokebook/ - Add a new joke
    router.post('/', jokeController.createJoke);

    //PUT /jokebook/'/:id'
    router.put('/:id', jokeController.updateJoke);

    //DELETE /jokebook/'/:id'
    router.delete('/:id', jokeController.deleteJoke);


    // --- Error Handling Route ---
    // This route will catch any requests to /jokebook that did not match 
    // the routes defined above (e.g., /jokebook/typo)
    router.use((req, res) => {
        // Since the request reached this point, it means no other route matched
        // This is a 404 Not Found specifically for the /jokebook space
        res.status(404).json({ error: 'Jokebook resource not found' });
    });

    return router;
};

module.exports = jokeRouterFactory;