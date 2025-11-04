/**
 * Joke Controller Factory
 * Creates and returns the JokeController object, which contains all route handlers.
 *
 * This controller is updated to match the new model and router logic:
 * - It expects the JokeModel methods: getAllCategories, getJokesByCategoryId, and addJoke.
 * - It fetches jokes using the numeric category ID from the URL parameter (req.params.id).
 * - It expects new jokes to be sent with 'setup', 'delivery', and 'categoryId' in the body.
 *
 * @param {object} jokeModel - The JokeModel interface (created by jokeModelFactory).
 * @returns {object} The JokeController interface.
 */
const jokeControllerFactory = (jokeModel) => {
    /**
     * GET /jokebook/categories
     * Responds with a list of all distinct joke categories.
     */
    const getCategories = async (req, res) => {
        try {
            // jokeModel.getAllCategories returns [{ id, category_name }, ...]
            const categories = await jokeModel.getAllCategories();
            res.status(200).json(categories);
        } catch (error) {
            console.error('Error fetching categories:', error.message);
            res.status(500).json({ error: 'Failed to fetch joke categories.' });
        }
    };

    /**
     * GET /jokebook/categories/:id
     * Responds with all jokes belonging to a specific category ID.
     */
    const getJokesByCategoryId = async (req, res) => {
        // Retrieve the category ID from the route parameter
        const categoryId = parseInt(req.params.id, 10);

        // Input validation: ensure the ID is a valid number
        if (isNaN(categoryId)) {
            return res.status(400).json({ error: 'Invalid category ID provided. ID must be a number.' });
        }

        try {
            // Call the model function that queries by category ID
            const jokes = await jokeModel.getJokesByCategoryId(categoryId);

            if (jokes.length === 0) {
                // Return 404 if the ID is valid but no jokes were found
                return res.status(404).json({ message: 'No jokes found for this category ID.' });
            }

            // Successfully retrieved jokes
            res.status(200).json(jokes);
        } catch (error) {
            console.error(`Error fetching jokes for category ID ${categoryId}:`, error.message);
            // Internal Server Error due to database issue
            res.status(500).json({ error: 'Failed to fetch jokes by category ID from the database.' });
        }
    };

    /**
     * POST /jokebook/jokes
     * Adds a new joke to the database.
     * Expects body: { setup: string, delivery: string, categoryId: number }
     */
    const addJoke = async (req, res) => {
        // Destructure the expected fields from the request body
        const { setup, delivery, categoryId } = req.body;

        // Validation for required fields
        if (!setup || !delivery || categoryId === undefined) {
            return res.status(400).json({ error: 'Missing required fields: setup, delivery, and categoryId are needed.' });
        }

        const numericCategoryId = parseInt(categoryId, 10);
        if (isNaN(numericCategoryId)) {
             return res.status(400).json({ error: 'Category ID must be a valid number.' });
        }

        try {
            // Call the model function, passing setup, delivery, and categoryId
            const newJoke = await jokeModel.addJoke(setup, delivery, numericCategoryId);
            // Respond with the newly created joke object and a 201 status
            res.status(201).json(newJoke);
        } catch (error) {
            console.error('Error adding joke:', error.message);
            res.status(500).json({ error: 'Failed to add the new joke to the database.' });
        }
    };

    return {
        getCategories,
        getJokesByCategoryId,
        addJoke
    };
};

module.exports = jokeControllerFactory;
