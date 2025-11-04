/**
 * Joke Model Factory
 * Creates and returns the JokeModel object, which handles all database interactions
 * for the 'jokes' and 'categories' tables.
 *
 * @param {object} pool - The PostgreSQL connection pool.
 * @returns {object} The JokeModel interface.
 */
const jokeModelFactory = (pool) => {
    /**
     * Retrieves all categories and their IDs from the database.
     * @returns {Array<Object>} An array of category objects: [{ id, category_name }, ...]
     */
    const getAllCategories = async () => {
        try {
            const query = 'SELECT id, name AS category_name FROM categories ORDER BY name ASC';
            const { rows } = await pool.query(query);
            return rows;
        } catch (error) {
            // CRITICAL: Log the actual SQL error message
            console.error('MODEL ERROR (getAllCategories):', error.message);
            throw error; // Re-throw the error for the controller to handle
        }
    };

    /**
     * Retrieves all jokes associated with a specific category ID.
     * It uses a JOIN to include the category name for context.
     *
     * @param {number} categoryId - The ID of the category to filter by.
     * @returns {Array<Object>} An array of joke objects: [{ id, setup, delivery, category_id, category_name }, ...]
     */
    const getJokesByCategoryId = async (categoryId) => {
        try {
            // *** CRITICAL FIX: Ensure 'setup' and 'delivery' columns are correctly referenced. ***
            const query = `
                SELECT
                    j.id,
                    j.setup, 
                    j.delivery,
                    j.category_id,
                    c.name AS category_name
                FROM jokes j
                JOIN categories c ON j.category_id = c.id
                WHERE j.category_id = $1
                ORDER BY j.id ASC;
            `;
            const { rows } = await pool.query(query, [categoryId]);
            return rows;
        } catch (error) {
            // CRITICAL: Log the actual SQL error message
            console.error(`MODEL ERROR (getJokesByCategoryId) for ID ${categoryId}:`, error.message);
            throw error; // Re-throw the error for the controller to handle
        }
    };

    /**
     * Adds a new two-part joke (setup and delivery) to the database
     * and associates it with a category ID.
     *
     * @param {string} setup - The first part (question) of the joke.
     * @param {string} delivery - The second part (punchline) of the joke.
     * @param {number} categoryId - The ID of the category the joke belongs to.
     * @returns {object} The newly created joke object, including its ID.
     */
    const addJoke = async (setup, delivery, categoryId) => {
        try {
            // SQL query uses the correct column names: setup, delivery, and category_id
            const query = `
                INSERT INTO jokes (setup, delivery, category_id)
                VALUES ($1, $2, $3)
                RETURNING id, setup, delivery, category_id;
            `;
            const { rows } = await pool.query(query, [setup, delivery, categoryId]);

            return rows[0];
        } catch (error) {
            // CRITICAL: Log the actual SQL error message
            console.error('MODEL ERROR (addJoke):', error.message);
            throw error;
        }
    };

    return {
        getAllCategories,
        getJokesByCategoryId,
        addJoke,
    };
};

module.exports = jokeModelFactory;
