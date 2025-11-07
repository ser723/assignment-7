/**
 * Main Express Application Server
 * This file sets up the Express application, configures middleware,
 * initializes the Joke Database Model, and mounts the router
 * to handle all requests under the '/jokebook' path.
 */
// Core imports
const express = require('express');
const cors = require('cors');
const path = require('path'); // Needed for path.join (e.g., serving index.html)
// Load environment variables (like DATABASE_URL)
require('dotenv').config(); 

// Factory and Model imports
// NOTE: Assuming these paths are correct for your project structure.
const jokeControllerFactory = require('./controllers/jokeControllerFactory');
const jokeRouterFactory = require('./routes/jokeRouter');
const jokeModel = require('./models/jokeModel'); // Import the Database Model

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middleware Configuration ---
// 1. Essential for parsing JSON request bodies
app.use(express.json()); 

// 2. CORS Configuration (Allows frontend access from any origin, fixing the 'null' origin issue)
app.use(cors());

// --- Initial Routes ---
// Serve the index.html file when accessing the root URL (http://localhost:3000/)
app.get('/', (req, res) => {
    // Assuming index.html is in the root directory (where server.js is located)
    res.sendFile(path.join(__dirname, 'index.html'));
});


/**
 * Function to initialize DB, mount the Joke Router, and start the Express server.
 */
async function startServer() {
    try {
        console.log('Initializing database model...');
        // 1. Initialize Database and get connection/db access object
        const db = await jokeModel.initDb();
        console.log('Database connection pool established successfully.');

        // 2. Create Controller (injecting the database access object)
        const jokeController = jokeControllerFactory(db);

        // 3. Create Router (injecting the controller methods)
        const jokeRouter = jokeRouterFactory(jokeController);

        // 4. Mount the Joke Router at the '/jokebook' path
        app.use('/jokebook', jokeRouter);
        console.log('Joke router mounted successfully.');
        
        // 5. Global Error Handler (Must be defined last to catch all errors)
        app.use((err, req, res, next) => {
            console.error('Unhandled Server Error:', err.stack);
            // Check if headers have already been sent
            if (res.headersSent) {
                return next(err);
            }
            res.status(500).json({ error: 'Something went wrong! Internal Server Error.' });
        });

        // 6. Start the server listener
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
            console.log(`Access the application at http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error('CRITICAL ERROR: Failed to start server due to configuration or database issue.');
        console.error(error);
        // Exit process if critical initialization fails (e.g., database connection fails)
        process.exit(1); 
    }
}

// Start the whole application process
startServer();

// Export the app instance for testing or further configuration
module.exports = app;