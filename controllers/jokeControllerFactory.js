/**
 * Joke Controller Factory
 * Creates and returns the Joke Controller object, which handles the business logic,
 * input validation, and manages the request/response flow.
 *
 * It uses the factory pattern to accept and inject the Joke Model dependency.
 *
 * @param {object} jokeModel - The Joke Model interface for database access.
 * @returns {object} The Joke Controller interface.
 */
function jokeControllerFactory(jokeModel) {

    // --- Utility Function for Error Handling ---
    /**
     * Standardized error response wrapper.
     * @param {object} res - Express response object.
     * @param {Error} error - The caught error object.
     * @param {string} message - A user-friendly message for the client.
     * @param {number} statusCode - HTTP status code (default: 500).
     */
    const handleError = (res, error, message, statusCode = 500) => {
        console.error(message, error.stack);
        res.status(statusCode).json({ error: message });
    };

    // --- Controller Methods ---

    /**
     * GET /jokebook/categories
     * Retrieves all joke categories.
     */
    async function getCategories(req, res) {
        try {
            const categories = await jokeModel.getCategories();
            res.status(200).json(categories);
        } catch (error) {
            handleError(res, error, 'Failed to fetch categories.', 500);
        }
    }

    /**
     * GET /jokebook/jokes?categoryId=:id
     * Retrieves all jokes for a specific category ID, or a random joke if no ID is provided.
     */
    async function getJokes(req, res) {
        const categoryId = req.query.categoryId;

        try {
            if (categoryId) {
                // Input validation
                const id = parseInt(categoryId, 10);
                if (isNaN(id) || id <= 0) {
                    return res.status(400).json({ error: 'Invalid category ID format.' });
                }

                const jokes = await jokeModel.getJokesByCategoryId(id);
                // Return 200 even if empty, as finding 0 jokes in a category is a valid result.
                return res.status(200).json(jokes); 
            } else {
                // If no categoryId is provided, return a random joke
                const joke = await jokeModel.getRandomJoke();
                // If the database is empty, return 200 with an empty array.
                return res.status(200).json(joke ? [joke] : []);
            }
        } catch (error) {
            handleError(res, error, 'Failed to retrieve jokes.', 500);
        }
    }

    /**
     * POST /jokebook/jokes
     * Adds a new joke to the database.
     */
    async function addJoke(req, res) {
        const { setup, punchline, categoryId } = req.body;

        // Basic input validation
        if (!setup || !punchline || !categoryId) {
            return res.status(400).json({ error: 'Missing required fields: setup, punchline, or categoryId.' });
        }

        const id = parseInt(categoryId, 10);
        if (isNaN(id) || id <= 0) {
            return res.status(400).json({ error: 'Invalid category ID format.' });
        }

        try {
            const newJoke = await jokeModel.addJoke(setup.trim(), punchline.trim(), id);
            // HTTP 201 Created is the appropriate status for successful resource creation
            res.status(201).json(newJoke);
        } catch (error) {
            handleError(res, error, 'Failed to add the new joke.', 500);
        }
    }

    /**
     * PUT /jokebook/jokes/:id
     * Updates an existing joke.
     */
    async function updateJoke(req, res) {
        const jokeId = parseInt(req.params.id, 10);
        const { setup, punchline, categoryId } = req.body;
        
        // Input validation for route param
        if (isNaN(jokeId) || jokeId <= 0) {
            return res.status(400).json({ error: 'Invalid joke ID in path.' });
        }

        // Input validation for body fields
        if (!setup || !punchline || !categoryId) {
            return res.status(400).json({ error: 'Missing required fields: setup, punchline, or categoryId.' });
        }

        const catId = parseInt(categoryId, 10);
        if (isNaN(catId) || catId <= 0) {
            return res.status(400).json({ error: 'Invalid category ID in body.' });
        }
        
        try {
            const updatedJoke = await jokeModel.updateJoke(jokeId, setup.trim(), punchline.trim(), catId);
            
            if (!updatedJoke) {
                return res.status(404).json({ error: `Joke with ID ${jokeId} not found.` });
            }
            
            // Return the updated resource
            res.status(200).json(updatedJoke);
        } catch (error) {
            handleError(res, error, `Failed to update joke ID ${jokeId}.`, 500);
        }
    }

    /**
     * DELETE /jokebook/jokes/:id
     * Deletes a joke by ID.
     */
    async function deleteJoke(req, res) {
        const jokeId = parseInt(req.params.id, 10);

        if (isNaN(jokeId) || jokeId <= 0) {
            return res.status(400).json({ error: 'Invalid joke ID in path.' });
        }

        try {
            const success = await jokeModel.deleteJoke(jokeId);

            if (!success) {
                return res.status(404).json({ error: `Joke with ID ${jokeId} not found.` });
            }
            
            // HTTP 204 No Content is the standard response for successful deletion
            res.status(204).end(); 
        } catch (error) {
            handleError(res, error, `Failed to delete joke ID ${jokeId}.`, 500);
        }
    }

    // --- Return the public interface of the controller ---
    return {
        getCategories,
        getJokes,
        addJoke,
        updateJoke,
        deleteJoke
    };
}

module.exports = jokeControllerFactory;