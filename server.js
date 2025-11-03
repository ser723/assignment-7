//server.js
"use strict";

//Express setup
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

//Where environment variables are loaded from the .env file like PORT and DATABASE_URL
require('dotenv').config();

//Middleware setup-will help us process incoming requests on form data and json
const multer = require("multer");
app.use(multer().none());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

//Database Setup for pg
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL, //config for connecting to the database (Neon)
    ssl: { 
        rejectUnauthorized: false
     } 
});

//Test connection when the pool is created
pool.on('connect', () => {
    console.log('Connection to the database was successful');
});

pool.on( 'error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

//MVC Integration and Route Setup
const jokeRouter = require('./routes/jokeRouter');

//The jokeRouter will handle all requests to /jokebook endpoint to tie in with the joke controller and model to api paths
app.use('/jokebook', jokeRouter);

//Server Listener
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`); 
});