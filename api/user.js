const database = require("../config/database");

exports.getSubscriptionTypes = (request, response) => {
    database.getConnection(function (err, connection) {
        if (err) throw err;

        const subscriptionTypesQuery = "SELECT * FROM subscription_types ORDER BY subscription_type_id";

        connection.query(subscriptionTypesQuery, function (error, results, fields) {
            if (err) {
                response.status(500).json(
                    {
                        status: 500,
                        message: "Internal server error",
                    }
                );
                throw err;
            }

            let responseJSON = {
                status: 200,
                message: "OK",
                subscriptionTypes: [],
                total: results.length,
            };

            for (const currentSubscriptionType of results) {
                let currentSubscriptionTypeJSON = getCurrentSubscriptionTypeJSON(currentSubscriptionType);

                responseJSON.subscriptionTypes.push(currentSubscriptionTypeJSON);
            }

            response.status(200).json(responseJSON);

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
                response.status(500).json(
                    {
                        status: 500,
                        message: "Internal server error",
                    }
                );
                throw err;
            }

            if (results.length == 0) {
                const responseJSON = {
                    status: 404,
                    error: `Sorry, no subscription type with the ID: ${subscriptionTypeID} could be found`,
                };

                response.status(404).json(responseJSON);
            } else {
                const responseJSON = {
                    status: 200,
                    message: "OK",
                    subscriptionType: getCurrentSubscriptionTypeJSON(results[0]),
                };

                response.status(200).json(responseJSON);
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

exports.login = (request, response) => {
    const emailAddress = request.body.emailAddress;
    const password = request.body.password;

    console.log(`Email Address: ${emailAddress}`);
    console.log(`Password: ${password}`);

    database.getConnection(function (err, connection) {
        if (err) throw err;

        const emailAddressQuery = `SELECT * FROM users WHERE email_address = '${emailAddress}'`;

        connection.query(emailAddressQuery, function (error, results, fields) {
            if (err) {
                response.status(500).json(
                    {
                        status: 500,
                        message: "Internal server error",
                    }
                );
                throw err;
            }

            if (results.length == 0) {
                const responseJSON = {
                    status: 401,
                    message: "Unauthorised",
                    error: `Sorry, no user account with the email address: ${emailAddress} could be found. 
                        Please signup if you haven't yet.`,
                };

                response.status(401).json(responseJSON);
            } else {
                const passwordQuery = `SELECT * FROM users WHERE email_address = '${emailAddress}' 
                      AND password = SHA(SHA('${password}'))`;

                connection.query(passwordQuery, function (error, results, fields) {
                    if (err) {
                        response.status(500).json(
                            {
                                status: 500,
                                message: "Internal server error",
                            }
                        );
                        throw err;
                    }

                    if (results.length == 0) {
                        const responseJSON = {
                            status: 401,
                            message: "Unauthorised",
                            error: "Sorry, the password you have entered is incorrect.",
                        };

                        response.status(401).json(responseJSON);
                    } else {

                    }
                    /*
                                    const responseJSON = {
                                        status: 200,
                                        message: "OK",
                                        subscriptionType: getCurrentSubscriptionTypeJSON(results[0]),
                                    };

                                    response.status(200).json(responseJSON);
                    */
                });
            }

            connection.release();
            if (error) throw error;
        });
    });
};
