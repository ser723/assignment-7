/**
 * Joke Model Factory
 * This module is a factory function that creates and returns the JokeModel object.
 * It encapsulates all database access logic using the provided PostgreSQL connection pool.
 *
 * NOTE: Queries are now updated to match your database schema:
 * Table: 'jokes'
 * Columns for joke content: 'setup' and 'delivery'
 *
 * @param {Pool} pool - The PostgreSQL connection pool instance.
 * @returns {object} The JokeModel interface.
 */
const jokeModel = (pool) => {
    // We assume you have a 'categories' table to link to 'category_id' in 'jokes'.
    // If you don't have a 'categories' table, please let me know.
    // Assuming a 'categories' table exists with a 'name' column.
    const QUERIES = {
        // Fetches a list of all distinct categories. We need to JOIN to get the name.
        getAllCategories: `
            SELECT DISTINCT c.id, c.name AS category_name
            FROM categories c
            ORDER BY c.name ASC
        `,

        // Fetches all jokes belonging to a specific category (using the category ID).
        // Since the 'jokes' table uses category_id, we will query by ID.
        getJokesByCategoryId: `
            SELECT id, setup, delivery, category_id
            FROM jokes
            WHERE category_id = $1
        `,

        // Inserts a new joke. It requires the setup text, delivery text, and category ID.
        addJoke: `
            INSERT INTO jokes (setup, delivery, category_id)
            VALUES ($1, $2, $3)
            RETURNING id, setup, delivery, category_id
        `
    };

    /**
     * Retrieves all unique categories from the database.
     * @returns {Promise<Array<object>>} A promise resolving to an array of category objects {id, category_name}.
     */
    const getAllCategories = async () => {
        try {
            const result = await pool.query(QUERIES.getAllCategories);
            // This returns objects like { id: 1, category_name: 'Knock-knock' }
            return result.rows;
        } catch (error) {
            console.error('Error in getAllCategories model:', error);
            throw new Error('Database error when fetching categories.');
        }
    };

    /**
     * Retrieves all jokes for a given category ID.
     * @param {number} categoryId - The ID of the category to filter by.
     * @returns {Promise<Array<object>>} A promise resolving to an array of joke objects.
     */
    const getJokesByCategoryId = async (categoryId) => {
        try {
            const result = await pool.query(QUERIES.getJokesByCategoryId, [categoryId]);
            // Returns objects like { id: 1, setup: '...', delivery: '...', category_id: 1 }
            return result.rows;
        } catch (error) {
            console.error(`Error in getJokesByCategoryId model for ID "${categoryId}":`, error);
            throw new Error('Database error when fetching jokes by category ID.');
        }
    };

    /**
     * Adds a new joke to the database.
     * @param {string} setup - The setup text of the joke.
     * @param {string} delivery - The punchline (delivery) text of the joke.
     * @param {number} categoryId - The ID of the category.
     * @returns {Promise<object>} A promise resolving to the newly inserted joke object.
     */
    const addJoke = async (setup, delivery, categoryId) => {
        try {
            // Note: We use $1 for setup, $2 for delivery, $3 for categoryId
            const result = await pool.query(QUERIES.addJoke, [setup, delivery, categoryId]);
            return result.rows[0];
        } catch (error) {
            console.error('Error in addJoke model:', error);
            throw new Error('Database error when adding joke.');
        }
    };

    return {
        getAllCategories,
        getJokesByCategoryId,
        addJoke
    };
};

module.exports = jokeModel;
