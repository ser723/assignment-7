/**
 * Joke Model Factory
 * Creates and returns the Joke Model object, which abstracts data access logic
 * using a PostgreSQL connection pool.
 *
 * @param {object} pool - The pg Pool instance configured for the database connection.
 * @returns {object} The Joke Model interface.
 */
function jokeModelFactory(pool) {

    /**
     * Initializes the database schema: creates the categories and jokes tables if they do not exist.
     * Also seeds initial data.
     * @returns {Promise<void>}
     */
    async function initDb() {
        try {
            console.log('Initializing database schema...');
            
            // 1. Create Categories Table
            await pool.query(`
                CREATE TABLE IF NOT EXISTS categories (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(255) UNIQUE NOT NULL
                );
            `);

            // 2. Create Jokes Table
            await pool.query(`
                CREATE TABLE IF NOT EXISTS jokes (
                    id SERIAL PRIMARY KEY,
                    setup TEXT NOT NULL,
                    punchline TEXT NOT NULL,
                    category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE
                );
            `);

            // 3. Seed Initial Categories (Only insert if the table is empty)
            const categoryCount = await pool.query('SELECT COUNT(*) FROM categories');
            if (parseInt(categoryCount.rows[0].count) === 0) {
                console.log('Seeding initial categories...');
                await pool.query("INSERT INTO categories (name) VALUES ('Programming'), ('Dad Jokes'), ('Science')");
            }
            
            // 4. Seed Initial Jokes (Only insert if the table is empty)
            const jokeCount = await pool.query('SELECT COUNT(*) FROM jokes');
            if (parseInt(jokeCount.rows[0].count) === 0) {
                console.log('Seeding initial jokes...');

                // Fetch category IDs to link jokes correctly
                const catRows = await pool.query("SELECT id, name FROM categories WHERE name IN ('Programming', 'Dad Jokes', 'Science')");
                const categoryMap = catRows.rows.reduce((acc, row) => {
                    acc[row.name] = row.id;
                    return acc;
                }, {});

                await pool.query(
                    `INSERT INTO jokes (setup, punchline, category_id) VALUES 
                    ('Why do programmers prefer dark mode?', 'Because light attracts bugs.', $1),
                    ('What do you call a fish with no eyes?', 'Fsh.', $2),
                    ('Why don''t scientists trust atoms?', 'Because they make up everything.', $3),
                    ('How many programmers does it take to change a light bulb?', 'None, that''s a hardware problem.', $1),
                    ('I told my wife she was drawing her eyebrows too high.', 'She looked surprised.', $2)
                    `, [categoryMap['Programming'], categoryMap['Dad Jokes'], categoryMap['Science']]
                );
            }

            console.log('Database initialization complete.');

        } catch (error) {
            console.error('Error during database initialization:', error);
            throw error;
        }
    }
    
    // --- Data Retrieval Functions ---

    /**
     * Retrieves all categories.
     */
    async function getCategories() {
        const res = await pool.query('SELECT id, name FROM categories ORDER BY name');
        return res.rows;
    }

    /**
     * Retrieves all jokes for a specific category ID.
     */
    async function getJokesByCategoryId(categoryId) {
        // We use $1 for safe parameter substitution (prevents SQL injection)
        const res = await pool.query(
            'SELECT id, setup, punchline, category_id AS "categoryId" FROM jokes WHERE category_id = $1 ORDER BY id', 
            [categoryId]
        );
        return res.rows;
    }

    /**
     * Retrieves a random joke from all available jokes.
     */
    async function getRandomJoke() {
        const res = await pool.query('SELECT id, setup, punchline, category_id AS "categoryId" FROM jokes ORDER BY RANDOM() LIMIT 1');
        return res.rows.length > 0 ? res.rows[0] : null;
    }
    
    // --- Data Modification Functions ---

    /**
     * Adds a new joke to the database.
     */
    async function addJoke(setup, punchline, categoryId) {
        // 1. Basic category existence check (optional but good practice)
        const categoryCheck = await pool.query('SELECT id FROM categories WHERE id = $1', [categoryId]);
        if (categoryCheck.rows.length === 0) {
            throw new Error(`Category ID ${categoryId} does not exist.`);
        }
        
        // 2. Insert joke
        const res = await pool.query(
            'INSERT INTO jokes (setup, punchline, category_id) VALUES ($1, $2, $3) RETURNING id, setup, punchline, category_id AS "categoryId"',
            [setup, punchline, categoryId]
        );
        return res.rows[0];
    }

    /**
     * Updates an existing joke.
     */
    async function updateJoke(id, setup, punchline, categoryId) {
        // 1. Basic category existence check
        const categoryCheck = await pool.query('SELECT id FROM categories WHERE id = $1', [categoryId]);
        if (categoryCheck.rows.length === 0) {
            throw new Error(`Category ID ${categoryId} does not exist.`);
        }

        // 2. Update joke
        const res = await pool.query(
            'UPDATE jokes SET setup = $1, punchline = $2, category_id = $3 WHERE id = $4 RETURNING id, setup, punchline, category_id AS "categoryId"',
            [setup, punchline, categoryId, id]
        );
        return res.rows.length > 0 ? res.rows[0] : null;
    }

    /**
     * Deletes a joke by ID.
     */
    async function deleteJoke(id) {
        const res = await pool.query('DELETE FROM jokes WHERE id = $1 RETURNING id', [id]);
        return res.rowCount > 0;
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