// The controller is now a function that accepts the jokeModel instance
const jokeController = (jokeModel) => {
    
    // Ensure the model is passed, otherwise we can't interact with the DB
    if (!jokeModel) {
        throw new Error("Joke model not initialized. Cannot create controller.");
    }

    // GET /jokebook/categories
    const getAllCategories = async (req, res, next) => {
        try {
            const categories = await jokeModel.getAllCategories();
            res.json(categories);
        } catch (error) {
            // If the error doesn't have a status, default to 500 (Internal Server Error)
            if (!error.status) {
                error.status = 500;
            }
            next(error);
        }
    };

    // GET /jokebook/category/:category
    const getJokesByCategory = async (req, res, next) => {
        const category = req.params.category;
        
        // Basic validation for category parameter
        if (!category) {
            return res.status(400).json({ error: 'Category parameter is required.' });
        }

        try {
            const jokes = await jokeModel.getJokesByCategory(category);
            if (jokes.length === 0) {
                return res.status(404).json({ error: 'No jokes found for this category.' });
            }
            res.json(jokes);
        } catch (error) {
            // If the error doesn't have a status, default to 500
            if (!error.status) {
                error.status = 500;
            }
            next(error);
        }
    };

    // POST /jokebook/add
    const addJoke = async (req, res, next) => {
        const { joke, category } = req.body;

        // Validation
        if (!joke || !category) {
            return res.status(400).json({ error: 'Joke and category fields are required.' });
        }
        
        try {
            const newJokeId = await jokeModel.addJoke(joke, category);
            res.status(201).json({ 
                message: 'Joke added successfully', 
                id: newJokeId,
                joke: joke, 
                category: category 
            });
        } catch (error) {
            // If the error doesn't have a status, default to 500
            if (!error.status) {
                error.status = 500;
            }
            next(error);
        }
    };

    // Export the controller methods
    return {
        getAllCategories,
        getJokesByCategory,
        addJoke,
    };
};

module.exports = jokeController;
