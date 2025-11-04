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
     * @returns {Array<Object>} An array of category objects: [{ id: 1, category_name: 'Knock-knock' }, ...]
     */
    const getAllCategories = async () => {
        const query = 'SELECT id, name AS category_name FROM categories ORDER BY name ASC';
        const { rows } = await pool.query(query);
        return rows;
    };

    /**
     * Retrieves all jokes associated with a specific category ID.
     * It uses a JOIN to include the category name for context.
     *
     * @param {number} categoryId - The ID of the category to filter by.
     * @returns {Array<Object>} An array of joke objects: [{ id, setup, delivery, category_id, category_name }, ...]
     */
    const getJokesByCategoryId = async (categoryId) => {
        // Query joins jokes with categories on category_id
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
        // SQL query uses the correct column names: setup, delivery, and category_id
        const query = `
            INSERT INTO jokes (setup, delivery, category_id)
            VALUES ($1, $2, $3)
            RETURNING id, setup, delivery, category_id;
        `;
        const { rows } = await pool.query(query, [setup, delivery, categoryId]);

        // Note: This returns the raw joke object without the category name.
        // The controller can choose to fetch the category name separately if needed,
        // but for a simple add, the inserted data is usually sufficient.
        return rows[0];
    };

    return {
        getAllCategories,
        getJokesByCategoryId,
        addJoke,
    };
};

module.exports = jokeModelFactory;
