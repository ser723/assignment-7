/**
 * Joke Controller Factory
 * Creates and returns the JokeController object, which contains the business logic
 * for handling incoming Express requests and generating appropriate responses.
 *
 * It relies entirely on the provided JokeModel for all data persistence operations.
 *
 * @param {object} jokeModel - The JokeModel interface for database interaction.
 * @returns {object} The JokeController with all handler functions.
 */
const jokeControllerFactory = (jokeModel) => {

    /**
     * GET /jokebook/categories
     * Responds with a list of all unique joke categories.
     */
    const getCategories = async (req, res) => {
        try {
            const categories = await jokeModel.getCategories();
            // Map the result rows to just the category names for a cleaner API response
            const categoryNames = categories.map(cat => cat.name);
            res.status(200).json(categoryNames);
        } catch (error) {
            console.error('Error fetching categories:', error.message);
            res.status(500).json({ error: 'Failed to retrieve categories from database.' });
        }
    };

    /**
     * GET /jokebook/categories/:id
     * Responds with a list of jokes for the specified category ID.
     */
    const getJokesByCategoryId = async (req, res) => {
        const categoryId = parseInt(req.params.id, 10);
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : undefined;

        if (isNaN(categoryId)) {
            return res.status(400).json({ error: 'Invalid category ID provided.' });
        }

        try {
            const jokes = await jokeModel.getJokesByCategoryId(categoryId, limit);

            if (jokes.length === 0) {
                // If ID is valid but no jokes found (e.g., category exists but is empty)
                return res.status(404).json({ error: 'No jokes found for this category ID.' });
            }

            res.status(200).json(jokes);
        } catch (error) {
            console.error('Error fetching jokes by category:', error.message);
            res.status(500).json({ error: 'Failed to retrieve jokes from database.' });
        }
    };

    /**
     * GET /jokebook/random
     * Responds with a single random joke.
     */
    const getRandomJoke = async (req, res) => {
        try {
            const joke = await jokeModel.getRandomJoke();
            
            if (!joke) {
                return res.status(404).json({ error: 'No jokes available in the database.' });
            }

            res.status(200).json(joke);
        } catch (error) {
            console.error('Error fetching random joke:', error.message);
            res.status(500).json({ error: 'Failed to retrieve a random joke.' });
        }
    };

    /**
     * POST /jokebook/jokes
     * Adds a new joke to the database, creating the category if necessary.
     */
    const addJoke = async (req, res) => {
        const { category, setup, delivery } = req.body;

        if (!category || !setup || !delivery) {
            return res.status(400).json({ error: 'Missing required fields: category, setup, and delivery.' });
        }

        try {
            // The model handles finding/creating the category and inserting the joke
            const newJoke = await jokeModel.addJoke(category, setup, delivery);
            
            // Respond with the newly created joke object
            res.status(201).json({ 
                message: 'Joke added successfully!', 
                joke: newJoke 
            });
        } catch (error) {
            console.error('Error adding new joke:', error.message);
            // Check for specific database errors if needed, otherwise default to 500
            res.status(500).json({ error: 'Failed to add joke due to a database error.' });
        }
    };

    return {
        getCategories,
        getJokesByCategoryId,
        getRandomJoke,
        addJoke,
    };
};

module.exports = jokeControllerFactory;
