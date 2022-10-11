const mysql = require("mysql");
const dotenv = require("dotenv");
dotenv.config();

const databaseConfig = {
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME
};

const database = mysql.createPool(databaseConfig);

module.exports = database;