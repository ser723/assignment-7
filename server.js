/**
 * Main Express Application Server
 * This file sets up the Express application, configures middleware,
 * initializes the Joke Database Model, and mounts the router
 * to handle all requests under the '/jokebook' path.
 */
// This MUST be the first line of executable code to ensure DATABASE_URL is available.
require('dotenv').config(); 

// Core imports
const express = require('express');
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg'); // Required for database connection

// Factory and Model imports
const jokeControllerFactory = require('./controllers/jokeControllerFactory');
const jokeRouterFactory = require('./routes/jokeRouter');
const jokeModelFactory = require('./models/jokeModel'); 

const app = express();
const PORT = process.env.PORT || 3000;

// --- Database Connection Initialization ---

// Create the shared PostgreSQL connection pool instance
const pool = new Pool({
    // pg library automatically uses DATABASE_URL from .env if it is present.
    // The SSL configuration below is MANDATORY for cloud providers like Neon.
    ssl: {
        rejectUnauthorized: false
    }
});

// --- Middleware Configuration ---
// 1. Essential for parsing JSON request bodies
app.use(express.json()); 

// 2. CORS Configuration 
app.use(cors());

// --- Application Initialization and Startup ---

/**
 * Function to initialize DB, mount the Joke Router, and start the Express server.
 */
async function startServer() {
    try {
        console.log('Attempting database connection...');
        
        // 1. Create the Model instance, passing the configured Pool
        const jokeModel = jokeModelFactory(pool);

        // 2. Initialize Database Schema (this will block until connected and tables are checked)
        await jokeModel.initDb();
        console.log('Database connection pool established successfully.');

        // 3. Create Controller (injecting the database access object)
        const jokeController = jokeControllerFactory(jokeModel);

        // 4. Create Router (injecting the controller methods)
        const jokeRouter = jokeRouterFactory(jokeController);

        // 5. Mount the Joke Router at the '/jokebook' path
        app.use('/jokebook', jokeRouter);
        console.log('Joke router mounted successfully.');
        
        // 6. Root Route to serve the index.html file
        app.get('/', (req, res) => {
            // Assuming index.html is in the root directory (adjust path if needed)
            res.sendFile(path.join(__dirname, 'index.html'));
        });
        
        // 7. Global Error Handler (Must be defined last to catch all errors)
        app.use((err, req, res, next) => {
            console.error('Unhandled Server Error:', err.stack);
            if (res.headersSent) {
                return next(err);
            }
            res.status(500).json({ error: 'Something went wrong! Internal Server Error.' });
        });

        // 8. Start the server listener
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
            console.log(`Access the application at http://localhost:${PORT}`);
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

// Export the app instance for testing or further configuration
module.exports = app;