/**
 * Joke Controller Factory
 * Creates and returns the JokeController object, which contains all Express handler
 * functions for the joke API endpoints.
 *
 * @param {object} jokeModel - The JokeModel interface for database interaction.
 * @returns {object} The JokeController object with handler functions.
 */
function jokeControllerFactory(jokeModel) {
    const jokeController = {

        
    /**
         * GET /jokebook/categories
         * Retrieves all distinct joke categories from the database.
         * @param {object} req - Express request object.
         * @param {object} res - Express response object.
         * @param {function} next - Express next middleware function.
         */
        getCategories: async (req, res, next) => {
            try {
                // Call the model function to fetch categories
                const categories = await jokeModel.getCategories();

                // Respond with a 200 OK and the list of categories
                res.status(200).json(categories);
            } catch (error) {
                console.error("Error fetching categories:", error);
                // Pass the error to the Express error handler
                next(error); 
            }
        },

        /**
         * GET /jokebook/categories/:id
         * Retrieves all jokes for a specific category ID.
         */
        getJokeById: async (req, res, next) => {
            // Placeholder: Implement joke retrieval logic here
            res.status(501).json({ error: "Not Implemented: getJokeById" });
        },

        /**
         * GET /jokebook/random
         * Retrieves a single random joke.
         */
        getRandomJoke: async (req, res, next) => {
            // Placeholder: Implement random joke retrieval logic here
            res.status(501).json({ error: "Not Implemented: getRandomJoke" });
        },

        /**
         * POST /jokebook/
         * Creates a new joke.
         */
        createJoke: async (req, res, next) => {
            // Placeholder: Implement joke creation logic here
            res.status(501).json({ error: "Not Implemented: createJoke" });
        },

        /**
         * PUT /jokebook/:id
         * Updates an existing joke by ID.
         */
        updateJoke: async (req, res, next) => {
            // Placeholder: Implement joke update logic here
            res.status(501).json({ error: "Not Implemented: updateJoke" });
        },

        /**
         * DELETE /jokebook/:id
         * Deletes a joke by ID.
         */
        deleteJoke: async (req, res, next) => {
            // Placeholder: Implement joke deletion logic here
            res.status(501).json({ error: "Not Implemented: deleteJoke" });
        }
    };

    return jokeController;
}

module.exports = jokeControllerFactory;