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
const cors = require('cors');
// Load environment variables (like DATABASE_URL)
require('dotenv').config(); 

// Factory and Model imports
//const jokeControllerFactory = require('./controllers/jokeControllerFactory'); // CORRECTED: Should be 'jokeControllerFactory'
//const jokeRouterFactory = require('./routes/jokeRouter');
//const jokeModel = require('./models/jokeModel'); // Import the Database Model

// --- Initialization ---
//const {Pool} = require('pg');
//const { get } = require('http');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});
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
        const db = await jokeModel.initDb();
        const jokeController = jokeControllerFactory(db);
        const jokeRouter = jokeRouterFactory(jokeController);
        
        const app = express();

        //JSON body parser for incoming requests
        app.use(express.json());

        // ---CORS Configuration---
        // This middleware allows any external origin to make requests to this server.
        // It is important to remember that the placement should be before any route handling.
        app.use(cors());

        //serve index.html from public directory
        app.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, 'index.html'));
        });

        // Mount Joke Router
        app.use('/jokebook', jokeRouter);

        // Server Listener
        app.listen(PORT, () => {
            console.log(`Jokebook API running at http://localhost:${PORT}`);
        });

        app.use((err, req, res, next) => {
            console.error('Unhandled error:', err);
            res.status(500).json({ error: 'An unexpected error occurred.' });
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