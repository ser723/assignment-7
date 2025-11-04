// The Model handles all interactions with the PostgreSQL database.
"use strict";

const { Pool } = require('pg');

// Use environment variable for connection details.
// SSL configuration is essential for services like Neon.
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// Listener to log database connection errors right away
pool.on('error', (err) => {
    // This will print to the server console if the pool experiences an error
    console.error('Unexpected error on idle client (DB Pool):', err);
});

/**
 * Retrieves a list of all unique joke categories from the database.
 * @returns {Promise<string[]>} An array of category strings.
 */
async function getAllCategories() {
    try {
        // Assuming your joke table is named 'jokes' and the category column is 'category'
        const sql = 'SELECT DISTINCT category FROM jokes ORDER BY category ASC;';
        const result = await pool.query(sql);

        // Map the database rows to an array of simple strings
        return result.rows.map(row => row.category);

    } catch (err) {
        console.error('Database Error in getAllCategories:', err);
        // Rethrow the error so the controller can handle the 500 status
        throw err;
    }
}

/**
 * Retrieves a list of jokes belonging to a specific category.
 * @param {string} category - The category to filter by.
 * @returns {Promise<object[]>} An array of joke objects.
 */
async function getJokesByCategory(category) {
    try {
        // Use parameterized query to prevent SQL injection
        const sql = 'SELECT id, joke FROM jokes WHERE category = $1;';
        const values = [category];

        const result = await pool.query(sql, values);
        return result.rows;

    } catch (err) {
        console.error(`Database Error in getJokesByCategory for category '${category}':`, err);
        throw err;
    }
}

/**
 * Retrieves a single random joke from the database.
 * @returns {Promise<object>} A single joke object.
 */
async function getRandomJoke() {
    try {
        // ORDER BY RANDOM() is a standard way to get random rows in PostgreSQL
        const sql = 'SELECT id, joke, category FROM jokes ORDER BY RANDOM() LIMIT 1;';
        const result = await pool.query(sql);

        // Return the first (and only) row
        return result.rows[0] || null;

    } catch (err) {
        console.error('Database Error in getRandomJoke:', err);
        throw err;
    }
}

/**
 * Adds a new joke to the database.
 * @param {string} joke - The text of the joke.
 * @param {string} category - The category of the joke.
 * @returns {Promise<object>} The newly created joke object, including its ID.
 */
async function addJoke(joke, category) {
    try {
        const sql = 'INSERT INTO jokes (joke, category) VALUES ($1, $2) RETURNING id, joke, category;';
        const values = [joke, category];

        const result = await pool.query(sql, values);
        return result.rows[0];

    } catch (err) {
        console.error('Database Error in addJoke:', err);
        throw err;
    }
}

module.exports = {
    getAllCategories,
    getJokesByCategory,
    getRandomJoke,
    addJoke
};
