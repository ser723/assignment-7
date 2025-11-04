/**
 * Mock In-Memory Database for Jokebook
 */
let jokeData = [
    { id: 1, category: "Knock-Knock", setup: "Knock, knock.", delivery: "Who's there? Nana. Nana who? Nana your business!", categoryId: 1 },
    { id: 2, category: "Programming", setup: "Why do Java developers wear glasses?", delivery: "Because they don't C#.", categoryId: 2 },
    { id: 3, category: "One Liner", setup: "I'm reading a book on anti-gravity.", delivery: "It's impossible to put down!", categoryId: 3 },
    { id: 4, category: "Programming", setup: "How many programmers does it take to change a light bulb?", delivery: "None, that's a hardware problem.", categoryId: 2 },
    { id: 5, category: "Knock-Knock", setup: "Knock, knock.", delivery: "Who's there? Lettuce. Lettuce who? Lettuce in!", categoryId: 1 },
    { id: 6, category: "One Liner", setup: "I told my wife she was drawing her eyebrows too high.", delivery: "She looked surprised.", categoryId: 3 },
];

let categoryData = [
    { id: 1, name: "Knock-Knock" },
    { id: 2, name: "Programming" },
    { id: 3, name: "One Liner" },
];

let nextJokeId = jokeData.length + 1;
let nextCategoryId = categoryData.length + 1;

/**
 * Joke Controller Factory
 * Creates and returns the JokeController object with methods for handling joke-related requests.
 * * @returns {object} The JokeController interface.
 */
const jokeControllerFactory = () => {

    /**
     * Handles GET /categories
     * @param {object} req - Express request object
     * @param {object} res - Express response object
     */
    const getCategories = (req, res) => {
        try {
            // Respond with the list of categories
            res.status(200).json({ 
                status: 'success', 
                data: categoryData 
            });
        } catch (error) {
            console.error('Error fetching categories:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    };

    /**
     * Handles GET /categories/:id
     * @param {object} req - Express request object (expects categoryId in params, optional limit in query)
     * @param {object} res - Express response object
     */
    const getJokesByCategoryId = (req, res) => {
        const categoryId = parseInt(req.params.id, 10);
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : undefined;

        if (isNaN(categoryId)) {
            return res.status(400).json({ error: 'Invalid category ID format' });
        }

        const category = categoryData.find(c => c.id === categoryId);
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }

        let jokes = jokeData.filter(joke => joke.categoryId === categoryId);
        
        if (jokes.length === 0) {
             return res.status(404).json({ error: `No jokes found for category ID ${categoryId}` });
        }

        // Apply limit if provided
        if (limit && !isNaN(limit) && limit > 0) {
            jokes = jokes.slice(0, limit);
        }

        res.status(200).json({ 
            status: 'success', 
            category: category.name,
            count: jokes.length,
            data: jokes 
        });
    };

    /**
     * Handles GET /random
     * @param {object} req - Express request object
     * @param {object} res - Express response object
     */
    const getRandomJoke = (req, res) => {
        if (jokeData.length === 0) {
            return res.status(404).json({ error: 'No jokes available' });
        }
        
        const randomIndex = Math.floor(Math.random() * jokeData.length);
        const randomJoke = jokeData[randomIndex];

        res.status(200).json({ 
            status: 'success', 
            data: randomJoke 
        });
    };


    /**
     * Handles POST /jokes
     * @param {object} req - Express request object (expects category, setup, delivery in body)
     * @param {object} res - Express response object
     */
    const addJoke = (req, res) => {
        const { category, setup, delivery } = req.body;

        // Basic validation
        if (!category || !setup || !delivery) {
            return res.status(400).json({ error: 'Missing required fields: category, setup, and delivery must be provided.' });
        }

        // Check if category already exists, otherwise create a new one
        let existingCategory = categoryData.find(c => c.name.toLowerCase() === category.toLowerCase());
        
        if (!existingCategory) {
            existingCategory = { id: nextCategoryId++, name: category };
            categoryData.push(existingCategory);
            console.log(`New category created: ${category}`);
        }

        const newJoke = {
            id: nextJokeId++,
            category: existingCategory.name,
            setup: setup,
            delivery: delivery,
            categoryId: existingCategory.id
        };

        // Add the new joke to the in-memory data
        jokeData.push(newJoke);
        
        // Respond with the created resource and 201 status
        res.status(201).json({ 
            status: 'success', 
            message: 'Joke added successfully!', 
            data: newJoke 
        });
    };

    return {
        getCategories,
        getJokesByCategoryId,
        getRandomJoke,
        addJoke,
    };
};

module.exports = jokeControllerFactory;
