/**
 * Joke Model Factory
 * Creates and returns the Joke Model object, which encapsulates all direct
 * database interaction logic for jokes and categories.
 *
 * It uses the factory pattern to accept and inject the PostgreSQL connection
 * pool dependency.
 *
 * @param {object} pool - The shared pg.Pool instance from the server.
 * @returns {object} The Joke Model interface.
 */
function jokeModelFactory(pool) {

    /**
     * Initializes the database schema. Creates the 'categories' and 'jokes'
     * tables if they do not already exist, and populates the categories table.
     */
    async function initDb() {
        console.log('Initializing database schema...');
        const client = await pool.connect();
        try {
            // Start a transaction for safe schema initialization
            await client.query('BEGIN');

            // 1. Create Categories Table
            const createCategoriesTable = `
                CREATE TABLE IF NOT EXISTS categories (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(50) UNIQUE NOT NULL
                );
            `;
            await client.query(createCategoriesTable);
            console.log('Table "categories" checked/created.');

            // 2. Create Jokes Table
            const createJokesTable = `
                CREATE TABLE IF NOT EXISTS jokes (
                    id SERIAL PRIMARY KEY,
                    setup TEXT NOT NULL,
                    punchline TEXT NOT NULL,
                    category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
                    date_added TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                );
            `;
            await client.query(createJokesTable);
            console.log('Table "jokes" checked/created.');

            // 3. Seed initial categories only if the table is empty
            const seedCategories = `
                INSERT INTO categories (name) 
                VALUES ('Programming'), ('Puns'), ('Knock-Knock'), ('Animal')
                ON CONFLICT (name) DO NOTHING;
            `;
            await client.query(seedCategories);
            console.log('Initial categories seeded.');

            await client.query('COMMIT');
            console.log('Database initialization complete.');

        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error during DB initialization:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Retrieves all categories from the database.
     * @returns {Array<object>} List of category objects.
     */
    async function getCategories() {
        const query = 'SELECT id, name FROM categories ORDER BY name;';
        try {
            const result = await pool.query(query);
            return result.rows;
        } catch (error) {
            console.error('Error fetching categories:', error);
            throw new Error('Failed to retrieve categories from database.');
        }
    }

    /**
     * Retrieves all jokes associated with a specific category ID.
     * @param {number} categoryId - The ID of the category.
     * @returns {Array<object>} List of joke objects.
     */
    async function getJokesByCategoryId(categoryId) {
        const query = `
            SELECT id, setup, punchline, category_id
            FROM jokes
            WHERE category_id = $1
            ORDER BY date_added DESC;
        `;
        try {
            const result = await pool.query(query, [categoryId]);
            return result.rows;
        } catch (error) {
            console.error(`Error fetching jokes for category ${categoryId}:`, error);
            throw new Error('Failed to retrieve jokes by category from database.');
        }
    }

    /**
     * Retrieves a single random joke from the database.
     * @returns {object|null} A single joke object or null if none exist.
     */
    async function getRandomJoke() {
        const query = `
            SELECT id, setup, punchline, category_id
            FROM jokes
            ORDER BY RANDOM()
            LIMIT 1;
        `;
        try {
            const result = await pool.query(query);
            return result.rows[0] || null;
        } catch (error) {
            console.error('Error fetching random joke:', error);
            throw new Error('Failed to retrieve a random joke from database.');
        }
    }

    /**
     * Adds a new joke to the database.
     * @param {string} setup - The setup part of the joke.
     * @param {string} punchline - The punchline part of the joke.
     * @param {number} categoryId - The ID of the joke's category.
     * @returns {object} The newly created joke object with its ID and date.
     */
    async function addJoke(setup, punchline, categoryId) {
        const query = `
            INSERT INTO jokes (setup, punchline, category_id)
            VALUES ($1, $2, $3)
            RETURNING id, setup, punchline, category_id, date_added;
        `;
        try {
            const result = await pool.query(query, [setup, punchline, categoryId]);
            return result.rows[0];
        } catch (error) {
            console.error('Error adding joke:', error);
            throw new Error('Failed to add joke to database.');
        }
    }

    /**
     * Updates an existing joke in the database.
     * @param {number} id - The ID of the joke to update.
     * @param {string} setup - The new setup part of the joke.
     * @param {string} punchline - The new punchline part of the joke.
     * @param {number} categoryId - The new category ID.
     * @returns {object|null} The updated joke object or null if the ID was not found.
     */
    async function updateJoke(id, setup, punchline, categoryId) {
        const query = `
            UPDATE jokes
            SET setup = $1, punchline = $2, category_id = $3
            WHERE id = $4
            RETURNING id, setup, punchline, category_id, date_added;
        `;
        try {
            const result = await pool.query(query, [setup, punchline, categoryId, id]);
            return result.rows[0] || null;
        } catch (error) {
            console.error(`Error updating joke ${id}:`, error);
            throw new Error('Failed to update joke in database.');
        }
    }

    /**
     * Deletes a joke from the database by its ID.
     * @param {number} id - The ID of the joke to delete.
     * @returns {boolean} True if a joke was deleted, false otherwise.
     */
    async function deleteJoke(id) {
        const query = 'DELETE FROM jokes WHERE id = $1 RETURNING id;';
        try {
            const result = await pool.query(query, [id]);
            return result.rowCount > 0;
        } catch (error) {
            console.error(`Error deleting joke ${id}:`, error);
            throw new Error('Failed to delete joke from database.');
        }
    }

    return {
        initDb,
        getCategories,
        getJokesByCategoryId,
        getRandomJoke,
        addJoke,
        updateJoke,
        deleteJoke
    };
}

module.exports = jokeModelFactory;