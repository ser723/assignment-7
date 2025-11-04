/**
 * Joke Model Factory
 * Creates and returns the JokeModel object, which handles all database interactions
 * for the 'jokes' and 'categories' tables.
 *
 * NOTE: Assumes the 'categories' table has columns: id (PK) and category_name.
 * NOTE: Assumes the 'jokes' table has columns: id (PK), category_id (FK), setup, and delivery.
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
            // Use the consistent category_name column name
            const query = 'SELECT id, category_name FROM categories ORDER BY category_name ASC';
            const { rows } = await pool.query(query);
            return rows;
        } catch (error) {
            console.error('MODEL ERROR (getAllCategories):', error.message);
            throw error;
        }
    };

    /**
     * Retrieves all jokes belonging to a specific category ID.
     * It uses a JOIN to include the category name for context.
     *
     * @param {number} category_id - The ID of the category to filter by.
     * @returns {Array<Object>} An array of joke objects: [{ id, setup, delivery, category_id, category_name }, ...]
     */
    const getJokesByCategoryId = async (category_id) => {
        try {
            // FIXED: Changed c.name to c.category_name for consistency and to match likely schema
            const query = `
                SELECT
                    j.id,
                    j.setup, 
                    j.delivery,
                    j.category_id,
                    c.category_name  <-- FIX: Use the correct column name from the categories table
                FROM jokes j
                JOIN categories c ON j.category_id = c.id
                WHERE j.category_id = $1
                ORDER BY j.id ASC;
            `;
            const { rows } = await pool.query(query, [category_id]);
            return rows;
        } catch (error) {
            console.error(`MODEL ERROR (getJokesByCategoryId) for ID ${category_id}:`, error.message);
            throw error;
        }
    };

    /**
     * Adds a new two-part joke (setup and delivery) to the database
     * and associates it with a category ID.
     *
     * @param {string} setup - The first part (question) of the joke.
     * @param {string} delivery - The second part (punchline) of the joke.
     * @param {number} category_id - The ID of the category the joke belongs to.
     * @returns {object} The newly created joke object, including its ID.
     */
    const addJoke = async (setup, delivery, category_id) => {
        try {
            // This query is correct based on your table columns (setup, delivery, category_id)
            const query = `
                INSERT INTO jokes (setup, delivery, category_id)
                VALUES ($1, $2, $3)
                RETURNING id, setup, delivery, category_id;
            `;
            const { rows } = await pool.query(query, [setup, delivery, category_id]);
            return rows[0];
        } catch (error) {
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