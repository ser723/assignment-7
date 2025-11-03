const jokeModel = require('../models/jokeModel');

//GET /jokebook/categories responds with a list of all available joke categories
const getAllCategories = async (req, res) => {
    try {
        const categories = await jokeModel.getAllCategories();
        res.status(200).json(categories);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch categories due to an internal server error."});
    }
};

//GET /jokebook/category/:category responds with jokes from the specified category
const getJokesByCategory = async (req, res) => {
    // Ensure correct parameter name 'category' is used.
    const category = req.params.category; 
    const limit = req.query.limit;

    try {
        const jokes = await jokeModel.getJokesByCategory(category, limit);

        // Standardized error check to match Model's return value ('invalid_category').
        if (jokes === 'invalid_category') {
            return res.status(404).json({ message: `Error: Category '${category}' is not valid.` });
        }
        res.status(200).json(jokes);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch jokes due to an internal server error."});
    }
};

//GET /jokebook/random responds with a single random joke from the database
const getRandomJoke = async (req, res) => {
    try {
        const joke = await jokeModel.getRandomJoke();

        if (!joke) {
            return res.status(404).json({ message: "No jokes found in the database." });
        }

        res.status(200).json(joke);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch a random joke due to an internal server error."});
    }
};

//POST /jokbook/joke/add adds a new joke to the database and responds with the updated joke list for that category
const addJoke = async (req, res) => {
    const { category, setup, delivery } = req.body;

    if (!category || !setup || !delivery) {
        return res.status(400).json({ 
            message: "Error: Missing one or more required attributes (category, setup, delivery) in the request body." 
        });
    }
    
    try {
        // Parameter order in Model call is (category, setup, delivery)
        const updatedJokes = await jokeModel.addJoke(category, setup, delivery);

        res.status(201).json({
            message: "Joke added successfully!",
            category: category,
            updatedJokes: updatedJokes
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: `Failed to add joke: ${error.message}` });
    }
};

module.exports = {
    getAllCategories,
    getJokesByCategory,
    getRandomJoke,
    addJoke
};
