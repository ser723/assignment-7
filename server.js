"use strict";

// The 'path' module must be imported to use path.join()
const path = require('path');
const express = require('express');
const app = express();

// If using dotenv to manage environment variables
require('dotenv').config();

const PORT = process.env.PORT || 3000;

// Middleware setup
const multer = require("multer");
app.use(multer().none());

app.use(express.urlencoded({ extended: true })); // To parse URL-encoded bodies
app.use(express.json());  // To parse JSON request bodies

// Serve static files from the 'public' directory for frontend
app.use(express.static( path.join(__dirname, 'public') ) );

// Database Setup for pg
const { Pool } = require('pg');

// Create the connection pool (but don't connect yet)
const pool = new Pool({
    connectionString: process.env.DATABASE_URL, // config for connecting to the database (Neon)
    ssl: { 
         rejectUnauthorized: false
    } 
});

// Utility function to test the database connection
async function testDbConnection() {
    try {
        const client = await pool.connect();
        console.log('Database connection pool established successfully.');
        client.release();
        return true;
    } catch (err) {
        console.error('CRITICAL ERROR: Failed to establish database connection.', err.message);
        return false;
    }
}

// Function to start the Express server, dependent on DB connection
async function startServer() {
    // Test connection before starting the server
    const isConnected = await testDbConnection();
    
    if (!isConnected) {
        console.error('Server shutdown due to database connection failure.');
        // Optionally exit the process if the database is mandatory
        // process.exit(1);
        return; 
    }

    // MVC Integration and Route Setup - Import after pool is confirmed ready
    // We now pass the pool instance to the jokeRouter initialization
    const jokeRouter = require('./routes/jokeRouter')(pool); 

    // The jokeRouter will handle all requests to /jokebook endpoint
    app.use('/jokebook', jokeRouter);

    // Simple root path handler to serve the main HTML page, index.html
    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });

    // Basic Error Handling Middleware for Express
    app.use((err, req, res, next) => { 
        console.error(err.stack);
        // Use the status code from the error if available, otherwise default to 500
        res.status(err.status || 500).send('Something broke! Internal Server Error: ' + err.message);
    });

    // Server Listener
    app.listen(PORT, () => {
         console.log(`Server is running on port ${PORT}`); 
         console.log(`Access the application at http://localhost:${PORT}`);
    });
}

// Start the whole application
startServer();