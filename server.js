//server.js
"use strict";

// The 'path' module must be imported to use path.join()
const path = require('path');
const express = require('express');
const app = express();

// If using dotenv to manage environment variables
require('dotenv').config();

const PORT = process.env.PORT || 3000;

// Middleware setup - will help us process incoming requests on form data and json
const multer = require("multer");
app.use(multer().none());

app.use(express.urlencoded({ extended: true })); //To parse URL-encoded bodies
app.use(express.json());  //To parse JSON request bodies

// Serve static files from the 'public' directory for frontend
app.use(express.static( path.join(__dirname, 'public') ) );

// Database Setup for pg
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL, //config for connecting to the database (Neon)
    ssl: { 
        rejectUnauthorized: false
} 
});

// Test connection when the pool is created
pool.on('connect', () => { 
     console.log('Connection to the database was successful');
});

pool.on( 'error', (err) => {
    console.error('Unexpected error on idle client', err);
    // Do not call process.exit(-1) unless you are sure you want to stop the server on any error
});

// MVC Integration and Route Setup
const jokeRouter = require('./routes/jokeRouter');

// The jokeRouter will handle all requests to /jokebook endpoint
app.use('/jokebook', jokeRouter);

// Simple root path handler to serve the main HTML page, index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Basic Error Handling Middleware for Express (4 arguments needed: err, req, res, next)
app.use((err, req, res, next) => { 
    console.error(err.stack);
     // Use the status code from the error if available, otherwise default to 500
    res.status(err.status || 500).send('Something broke! Internal Server Error.');
});

// Server Listener
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`); 
    console.log(`Access the application at http://localhost:${PORT}`);
});