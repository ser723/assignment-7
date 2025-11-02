const { Pool } = require('pg');

//Creation of a new pool instance to ensure correct ENV var 
//allowing the model to be independently responsible for DB connection details
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

//to GET /jokebook/categories fetch all unique categories from the jokes table
const getAllCategories = async () => {
    try {
        const query = ' SELECT name FROM categories ORDER BY name;';
        const result = await pool.query(query);
        return result. rows.map(row => row.name);
    } catch (error) {
        console.error("Error fetching getAllCategories:", error);
        throw new Error("Could not fetch categories from the database.");
    }
};

//to GET /jokebook/category/:category fetch all jokes from a specific category
const getJokesByCategory = async (category, limit) => {
    try {
        let query = `
            SELECT j.setup, j.delivery
            FROM jokes j
            JOIN categories c ON j.category_id = c.id
            WHERE c.name = $1
            ORDER BY j.id
            `;
            const values = [category];

            if (limit && !isNaN(parseInt(limit))) {
                query += ' LIMIT $2';
                values.push(parseInt(limit));
            } else {
                query += ';';
            }

            const result = await pool.query(query, values);
        
        if (result.rows.length === 0) {
            const categoryCheck = await pool.query('SELECT id FROM categories WHERE name = $1'[category]);
            if (categoryCheck.rows.length === 0) {
                return 'invalid category';
            }
        }

        return result.rows;
    } catch (error) {
        console.error('Error in getJokesByCategory for ${category}:', error);
        throw new Error("Could not fetch jokes from the database.");
    }
};

//to GET /jokebook/random fetch a single random joke from the jokes table
const getRandomJoke = async () => {
    try {
        const query = `
            SELECT setup, delivery
            FROM jokes
            ORDER BY RANDOM()
            LIMIT 1;
        `;
        const result = await pool.query(query);
        return result.rows[0];
    } catch (error) {
        console.error("Error in getRandomJoke:", error);
        throw new Error("Could not fetch a random joke from the database.");
    }
};

//to POST /jokebook/joke add a new joke to the jokes table
const addJoke = async (setup, delivery, category) => {
    try {
         // 1. Find or create the category ID
        let categoryResult = await pool.query('SELECT id FROM categories WHERE name = $1', [category]);

        if (categoryResult.rows.length === 0) {
            // Optionally, create the category if it doesn't exist
            categoryResult = await pool.query('INSERT INTO categories (name) VALUES ($1) RETURNING id', [category]);
        }
        const categoryId = categoryResult.rows[0].id;

        // 2. Insert the new joke
        const insertQuery = `
            INSERT INTO jokes (category_id, setup, delivery) 
            VALUES ($1, $2, $3);
        `;
        await pool.query(insertQuery, [categoryId, setup, delivery]);

        // 3. Return the updated joke list for that category (using existing function)This implicitly satisfies the 'responds with the updated jokebook for that category' requirement
        return getJokesByCategory(category); 

    } catch (error) {
        console.error("Error in addJoke:", error);
        // Check for common errors (e.g., category name too long) and provide specific feedback
        throw new Error(`Database error adding joke: ${error.message}`);
    }
};


module.exports = {
    getAllCategories,
    getJokesByCategory,
    getRandomJoke,
    addJoke,
};