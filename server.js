/**
 * Main Express Application Server
 * This file sets up the Express application, configures middleware,
 * imports the JokeController and JokeRouter, and mounts the router
 * to handle all requests under the '/jokebook' path.
 */

// Core imports
const express = require('express');
const path = require('path');

// Factory imports
const jokeControllerFactory = require('./jokeControllerFactory');
const jokeRouterFactory = require('./jokeRouter');

// --- Initialization ---
const app = express();
const PORT = 3000; 

// 1. Instantiate the Joke Controller
// This holds the business logic and mock data
const jokeController = jokeControllerFactory();

// 2. Instantiate the Joke Router
// This configures the routes using the controller methods
const jokeRouter = jokeRouterFactory(jokeController);


// --- Middleware Configuration ---

// Middleware to parse JSON request bodies (essential for POST /jokebook/jokes)
app.use(express.json());

// Serve static files (like public/index.html) from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));


// --- Route Mounting ---

// Mount the JokeRouter at the base path specified in the router's documentation
// All routes defined in jokeRouter.js will be prefixed with '/jokebook'
app.use('/jokebook', jokeRouter);

// Set up the root route to serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


// --- Server Start ---
app.listen(PORT, () => {
    console.log(`Jokebook API running at http://localhost:${PORT}`);
    console.log(`Client demo available at http://localhost:${PORT}/`);
});

// Export the app instance (useful for testing)
module.exports = app;