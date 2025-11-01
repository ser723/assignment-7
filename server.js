//server.js
"use strict";
const express = require("express");
const app = express();

const multer = require("multer");
app.use(multer().none());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

require('dotenv').config();

const { Pool } = required('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function testDb() {
    let quertText = 'SELECT NOW()';
}

