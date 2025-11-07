/**
 * jokeModel.js
 * * Provides database access functions for jokes and categories using the 'pg' library.
 * The connection is managed via a pool, configured using environment variables.
 */

const { Pool } = require('pg');
const fs = require('fs');

// The connection pool is initialized using the DATABASE_URL environment variable.
let pool;

const jokeModel = {
    /**
     * Initializes the database connection pool and attempts to create the schema 
     * if it doesn't already exist.
     */
    initDb: async function() {
        console.log("Initializing database schema...");
        try {
            // Configuration prioritizes the DATABASE_URL environment variable.
            const connectionString = process.env.DATABASE_URL;

            if (!connectionString) {
                // If DATABASE_URL is missing, log a critical warning.
                console.error("CRITICAL WARNING: DATABASE_URL is not set in environment variables. Falling back to default local connection parameters.");
                pool = new Pool();
            } else {
                // Use the provided DATABASE_URL (for Neon/Cloud deployment)
                // The 'pg' library automatically parses the connection string.
                pool = new Pool({
                    connectionString: connectionString,
                });
            }

            // Test the connection
            await pool.query('SELECT NOW()'); 
            console.log("Database connection pool established successfully.");

            // Attempt to create tables if they don't exist
            const createSchemaSql = fs.readFileSync('./sql/create_schema.sql', 'utf8');
            await pool.query(createSchemaSql);
            console.log("Database schema initialization complete.");

        } catch (error) {
            console.error("CRITICAL ERROR: Failed to start server due to configuration or database issue.");
            // Re-throw the error to prevent the server from starting with a bad DB connection
            throw new AggregateError([error], "Error during database initialization:");
        }
    },

    // --- CATEGORIES ---

    /**
     * Retrieves all joke categories from the database.
     * @returns {Promise<Array>} A promise that resolves to an array of category objects.
     */
    getCategories: async function() {
        // This function needs to be completed
        console.log("jokeModel.getCategories called.");
        // This is a placeholder. You will need to implement the actual DB query here.
        // For now, let's return a dummy empty array to stop the 500 error once the DB connects.
        // Once the DB connects, you will replace this with:
        // const queryText = 'SELECT id, name FROM categories ORDER BY name';
        // const { rows } = await pool.query(queryText);
        // return rows;

        return []; 
    },

    // --- JOKES ---

    /**
     * Retrieves a list of jokes by category ID.
     * @param {number} categoryId - The ID of the category.
     * @returns {Promise<Array>} A promise that resolves to an array of joke objects.
     */
    getJokesByCategoryId: async function(categoryId) {
        // To be implemented later
        return [];
    },

    /**
     * Retrieves a random joke.
     * @returns {Promise<Object|null>} A promise that resolves to a single joke object or null.
     */
    getRandomJoke: async function() {
        // To be implemented later
        return null;
    },

    /**
     * Creates a new joke in the database.
     * @param {Object} joke - The joke object containing text and category_id.
     * @returns {Promise<Object>} A promise that resolves to the newly created joke object (including its new ID).
     */
    createJoke: async function(joke) {
        // To be implemented later
        return {};
    },

    /**
     * Updates an existing joke by ID.
     * @param {number} id - The ID of the joke to update.
     * @param {Object} joke - The update joke data.
     * @returns {Promise<Object|null>} A promise that resolves to the updated joke object or null if not found.
     */
    updateJoke: async function(id, joke) {
        // To be implemented later
        return null;
    },

    /**
     * Deletes a joke by ID.
     * @param {number} id - The ID of the joke being deleted.
     * @returns {Promise<boolean>} A promise that resolves to true if deleted, false otherwise.
     */
    deleteJoke: async function(id) {
        // To be implemented later
        return false;
    },

    /**
     * Closes the database connection pool (for graceful shutdown).
     */
    close: async function() {
        if (pool) {
            await pool.end();
            console.log("Database pool closed.");
        }
    }
};

module.exports = jokeModel;