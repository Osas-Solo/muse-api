const express = require("express");
const database = require("../config/database");

exports.getSubscriptionTypes = (request, response) => {
    database.getConnection(function(err, connection) {
        if (err) throw err;

        connection.query("SELECT * FROM subscription_types", function (error, results, fields) {

            response.send(results);

            connection.release();
            if (error) throw error;
        });
    });
};