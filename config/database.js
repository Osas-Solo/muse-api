const mysql = require("mysql");

const database = mysql.createPool({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME
});

database.getConnection((error, connection) => {
    if (error) {
        console.log("Sorry, there was an error during database connection");
    }

    if (connection) {
        connection.release();
    }
});

module.exports = database;