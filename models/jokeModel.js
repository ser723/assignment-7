const jokeModel = (pool) => {

    // Ensure the pool object is available for the functions to use
    if (!pool) {
        // This should not happen if startServer runs correctly, but good for safety
        throw new Error("Database pool not provided to jokeModel.");
    }

    const getAllCategories = async () => {
        try {
            // Query the database to get distinct categories
            // Uses 'category' as defined in the CREATE TABLE script
            const result = await pool.query('SELECT DISTINCT category FROM jokes');
            // Extract and return an array of category strings
            return result.rows.map(row => row.category);
        } catch (err) {
            console.error('Database Error in getAllCategories:', err);
            throw err;
        }
    };

    const getJokesByCategory = async (category) => {
        try {
            // Use parameterized query ($1) to prevent SQL injection
            // Uses 'joke' and 'category' as defined in the CREATE TABLE script
            const query = 'SELECT joke FROM jokes WHERE category = $1';
            const result = await pool.query(query, [category]);
            // Return the array of jokes (rows)
            return result.rows;
        } catch (err) {
            console.error(`Database Error in getJokesByCategory for category: ${category}`, err);
            throw err;
        }
    };

    const addJoke = async (joke, category) => {
        try {
            // Use parameterized query ($1, $2) to prevent SQL injection
            const query = 'INSERT INTO jokes (joke, category) VALUES ($1, $2) RETURNING id';
            const result = await pool.query(query, [joke, category]);
            // Return the ID of the newly inserted joke
            return result.rows[0].id;
        } catch (err) {
            console.error('Database Error in addJoke:', err);
            throw err;
        }
    };

    // Export the public methods
    return {
        getAllCategories,
        getJokesByCategory,
        addJoke,
    };
};

module.exports = jokeModel;
