/**
 * Joke Database Model (jokeModel.js)
 * Manages all persistent data operations for the jokes and categories using PostgreSQL.
 * Requires the 'pg' library to be installed (npm install pg).
 *
 * NOTE: It uses environment variables (DATABASE_URL, etc.) for configuration.
 */
const { Pool } = require('pg');

// Initialize the PostgreSQL connection pool
// This will automatically look for standard environment variables like DATABASE_URL
const pool = new Pool();

/**
 * Initializes the database tables: categories and jokes.
 * This should be called once when the application starts up.
 */
async function initDb() {
    console.log('Initializing database schema...');
    try {
        // 1. Create Categories Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS categories (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) UNIQUE NOT NULL
            );
        `);
        console.log('Categories table ensured.');

        // 2. Create Jokes Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS jokes (
                id SERIAL PRIMARY KEY,
                category_id INT REFERENCES categories(id) ON DELETE CASCADE,
                setup TEXT NOT NULL,
                delivery TEXT NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Jokes table ensured.');

        // 3. Insert initial data (if categories table is empty)
        const initialCategories = ['programming', 'knock-knock', 'science'];
        for (const catName of initialCategories) {
            await pool.query(
                `INSERT INTO categories (name) VALUES ($1) ON CONFLICT (name) DO NOTHING;`,
                [catName]
            );
        }

        // We will insert initial jokes lazily via the API or another setup script
        
        console.log('Database initialization complete.');
    } catch (error) {
        console.error('Error during database initialization:', error.message);
        throw error;
    }
}

/**
 * Fetches all unique joke categories from the database.
 * @returns {Promise<Array<object>>} List of categories.
 */
async function getCategories() {
    const result = await pool.query('SELECT id, name FROM categories ORDER BY name');
    return result.rows;
}

/**
 * Fetches jokes belonging to a specific category ID, with an optional limit.
 * @param {number} categoryId The ID of the category.
 * @param {number|string} limit The maximum number of jokes to return.
 * @returns {Promise<Array<object>>} List of jokes.
 */
async function getJokesByCategoryId(categoryId, limit = 100) {
    const query = `
        SELECT j.id, c.name as category, j.setup, j.delivery 
        FROM jokes j 
        JOIN categories c ON j.category_id = c.id 
        WHERE j.category_id = $1 
        ORDER BY j.created_at DESC
        LIMIT $2;
    `;
    const result = await pool.query(query, [categoryId, limit]);
    return result.rows;
}

/**
 * Fetches a single random joke from the database.
 * @returns {Promise<object|null>} A single joke object or null.
 */
async function getRandomJoke() {
    // ORDER BY RANDOM() is efficient for small tables or when LIMIT 1 is used
    const query = `
        SELECT j.id, c.name as category, j.setup, j.delivery 
        FROM jokes j 
        JOIN categories c ON j.category_id = c.id 
        ORDER BY RANDOM() 
        LIMIT 1;
    `;
    const result = await pool.query(query);
    return result.rows[0] || null;
}

/**
 * Adds a new joke to the database. If the category does not exist, it creates it first.
 * @param {string} categoryName The name of the category.
 * @param {string} setup The setup line of the joke.
 * @param {string} delivery The delivery line/punchline of the joke.
 * @returns {Promise<object>} The newly created joke object with its ID.
 */
async function addJoke(categoryName, setup, delivery) {
    // Start a transaction to ensure atomicity
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Find or create the category
        const categoryResult = await client.query(
            `INSERT INTO categories (name) VALUES ($1) 
             ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name 
             RETURNING id;`, 
            [categoryName.toLowerCase()]
        );
        const categoryId = categoryResult.rows[0].id;

        // 2. Insert the joke
        const jokeResult = await client.query(
            `INSERT INTO jokes (category_id, setup, delivery) 
             VALUES ($1, $2, $3) 
             RETURNING id, created_at;`,
            [categoryId, setup, delivery]
        );

        await client.query('COMMIT');

        // Return the structure expected by the client
        return {
            id: jokeResult.rows[0].id,
            category: categoryName.toLowerCase(),
            setup: setup,
            delivery: delivery
        };
    } catch (e) {
        await client.query('ROLLBACK');
        console.error('Transaction failed during addJoke:', e);
        throw e;
    } finally {
        client.release();
    }
}

// Export the model and the initialization function
module.exports = {
    initDb,
    getCategories,
    getJokesByCategoryId,
    getRandomJoke,
    addJoke,
};