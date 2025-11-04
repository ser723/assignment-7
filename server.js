/**
 * Main Express Application Server
 * This file sets up the Express application, configures middleware,
 * imports the JokeControllerFactory, JokeRouter, and JokeModel, and mounts the router
 * to handle all requests under the '/jokebook' path.
 *
 * It includes initialization of the Joke Database Model before starting the server.
 */

// Core imports
const express = require('express');
const path = require('path');
// Load environment variables (like DATABASE_URL)
// NOTE: Make sure you have a .env file configured if using local development.
require('dotenv').config(); 

// Factory and Model imports
const jokeControllerFactory = require('./controllers/jokeControllerFactory'); // CORRECTED: Should be 'jokeControllerFactory'
const jokeRouterFactory = require('./jokeRouter');
const jokeModel = require('./jokeModel'); // Import the Database Model

// --- Initialization ---
const app = express();
const PORT = process.env.PORT || 3000;


// --- Middleware Configuration ---
app.use(express.json()); // Essential for parsing JSON request bodies (for POST /jokes)
// Serve static files (like public/index.html)
app.use(express.static(path.join(__dirname, 'public')));


/**
 * Function to initialize DB and start the Express server
 */
async function startServer() {
    try {
        // 1. Database Initialization: Ensure tables exist and initial data is present
        await jokeModel.initDb();
        console.log('Database ready. Starting server setup...');

        // 2. Initialize the Controller (requires: jokeModel)
        const jokeController = jokeControllerFactory(jokeModel);

        // 3. Initialize the Router (requires: jokeController)
        const jokeRouter = jokeRouterFactory(jokeController);
        
        // 4. Mount the Router at the base path
        app.use('/jokebook', jokeRouter);

        // 5. Root Route: Serves the index.html from the public directory
        app.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, 'public', 'index.html'));
        });

        // 6. Server Listener
        app.listen(PORT, () => {
            console.log(`Jokebook API running at http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error('CRITICAL ERROR: Failed to start server due to configuration or database issue.');
        console.error(error);
        // Exit process if critical initialization fails
        process.exit(1); 
    }
}

// Start the whole application process
startServer();

// Export the app instance (useful for testing)
module.exports = app;