const express = require('express');

/**
 * Joke Router Factory
 * Creates and returns an Express Router instance configured with all joke-related routes.
 * It uses the factory pattern to accept and inject the Joke Controller dependency.
 *
 * @param {object} jokeController - The Joke Controller object containing business logic handlers.
 * @returns {express.Router} An Express Router instance.
 */
function jokeRouterFactory(jokeController) {
    const router = express.Router();

    // --- Category Routes ---

    /**
     * Route: GET /jokebook/categories
     * Description: Retrieves a list of all available joke categories.
     * Controller Method: getCategories
     */
    router.get('/categories', jokeController.getCategories);

    // --- Joke Routes ---

    /**
     * Route: GET /jokebook/jokes
     * Description: Retrieves all jokes for a specific category (via query param 'categoryId') 
     * or a random joke if no categoryId is provided.
     * Controller Method: getJokes
     */
    router.get('/jokes', jokeController.getJokes);

    /**
     * Route: POST /jokebook/jokes
     * Description: Adds a new joke to the database.
     * Controller Method: addJoke
     */
    router.post('/jokes', jokeController.addJoke);

    /**
     * Route: PUT /jokebook/jokes/:id
     * Description: Updates an existing joke by its ID.
     * Controller Method: updateJoke
     */
    router.put('/jokes/:id', jokeController.updateJoke);

    /**
     * Route: DELETE /jokebook/jokes/:id
     * Description: Deletes a joke by its ID.
     * Controller Method: deleteJoke
     */
    router.delete('/jokes/:id', jokeController.deleteJoke);

    return router;
}

module.exports = jokeRouterFactory;