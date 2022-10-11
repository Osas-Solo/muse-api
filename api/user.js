const express = require("express");
const database = require("../config/database");

exports.getSubscriptionTypes = (request, response) => {
    database.getConnection(function (err, connection) {
        if (err) throw err;

        const subscriptionTypesQuery = "SELECT * FROM subscription_types ORDER BY subscription_type_id";

        connection.query(subscriptionTypesQuery, function (error, results, fields) {
            if (err) {
                response.status(500).json("Internal server error");
                throw err;
            }

            let responseJSON = {
                status: 200,
                subscriptionTypes: [],
                total: results.length,
            };

            for (const currentSubscriptionType of results) {
                let currentSubscriptionTypeJSON = getCurrentSubscriptionTypeJSON(currentSubscriptionType);

                responseJSON.subscriptionTypes.push(currentSubscriptionTypeJSON);
            }

            response.status(200).send(responseJSON);

            connection.release();
            if (error) throw error;
        });
    });
};

exports.getSubscriptionTypeByID = (request, response) => {
    const subscriptionTypeID = request.params.id;

    database.getConnection(function (err, connection) {
        if (err) throw err;

        const subscriptionTypeQuery = `SELECT * FROM subscription_types WHERE subscription_type_id = ${subscriptionTypeID}`;

        connection.query(subscriptionTypeQuery, function (error, results, fields) {
            if (err) {
                response.status(500).json("Internal server error");
                throw err;
            }

            if (results.length == 0) {
                const responseJSON = {
                    status: 404,
                    error: `Sorry, no subscription type with the ID: ${subscriptionTypeID} could be found`,
                };

                response.status(404).send(responseJSON);
            } else {
                const responseJSON = {
                    status: 200,
                    subscriptionType: getCurrentSubscriptionTypeJSON(results[0]),
                };

                response.status(200).send(responseJSON);
            }

            connection.release();
            if (error) throw error;
        });
    });
};

function getCurrentSubscriptionTypeJSON(currentSubscriptionType) {
    let currentSubscriptionTypeJSON = {
        subscriptionTypeID: currentSubscriptionType.subscription_type_id,
        subscriptionCode: currentSubscriptionType.subscription_code,
        subscriptionName: currentSubscriptionType.subscription_name,
        price: currentSubscriptionType.price,
        numberOfSongs: currentSubscriptionType.number_of_songs,
    };

    return currentSubscriptionTypeJSON;
}