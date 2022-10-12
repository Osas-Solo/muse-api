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
                    error: `Sorry, no user account with the email address: ${emailAddress} could be found. Please signup if you haven't yet.`,
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
                        const responseJSON = {
                            status: 200,
                            message: "OK",
                            user: getUserJSON(results[0]),
                        };

                        response.status(200).json(responseJSON);
                    }
                });
            }

            connection.release();
            if (error) throw error;
        });
    });
};

function getUserJSON(user) {
    let userJSON = {
        userID: user.user_id,
        emailAddress: user.email_address,
        fullName: user.first_name + " " + user.last_name,
        gender: (user.gender === 'M') ? "Male" : "Female",
        phoneNumber: user.phone_number,
        joinDate: user.join_date,
        currentSubscription: user.current_subscription,
    };

    if (userJSON.currentSubscription != null) {
        userJSON.currentSubscription = getSubscriptionJSON(userJSON.currentSubscription);
    }

    return userJSON;
}

function getSubscriptionJSON(subscriptionID) {
    let subscriptionJSON = {
        subscriptionID: null,
        transactionReference: null,
        subscriptionType: null,
        numberOfRecognisedSongs: null,
        numberOfSongsLeft: null,
        subscriptionDate: null,
        pricePaid: null,
    };

    database.getConnection(function (err, connection) {
        if (err) throw err;

        const subscriptionQuery = `SELECT * FROM subscriptions s
                                    INNER JOIN subscription_types t ON s.subscription_type_id = t.subscription_type_id
                                    WHERE subscription_id = ${subscriptionID}`;

        connection.query(subscriptionQuery, function (error, results, fields) {
            if (err) {
                throw err;
            }

            if (results.length !== 0) {
                subscriptionJSON.subscriptionID = results[0].subscription_id;
                subscriptionJSON.transactionReference = results[0].transaction_reference;
                subscriptionJSON.subscriptionType = results[0].subscription_name;
                subscriptionJSON.numberOfRecognisedSongs = results[0].number_of_recognised_songs;
                subscriptionJSON.numberOfSongsLeft = results[0].number_of_songs - results[0].number_of_recognised_songs;
                subscriptionJSON.subscriptionDate = results[0].subscription_date;
                subscriptionJSON.pricePaid = results[0].price_paid;
            }

            connection.release();
            if (error) throw error;

            console.log("C:");
            console.log(subscriptionJSON);
         });
     });

    console.log("L:");
    console.log(subscriptionJSON);

    return subscriptionJSON;
}

exports.signup = (request, response) => {
    const emailAddress = request.body.emailAddress;
    const password = request.body.password;
    const firstName = request.body.firstName;
    const lastName = request.body.lastName;
    const gender = request.body.gender;
    const phoneNumber = request.body.phoneNumber;

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

            if (results.length > 0) {
                const responseJSON = {
                    status: 401,
                    message: "Unauthorised",
                    error: `Sorry, there is already a user account with the email address: ${emailAddress}. Please login instead if you have previously signed up.`,
                };

                response.status(401).json(responseJSON);
            } else {
                const userInsertQuery = `INSERT INTO users (email_address, password, first_name, last_name, gender, phone_number) 
                    VALUE ('${emailAddress}', SHA(SHA('${password}')), '${firstName}', '${lastName}', '${gender}', '${phoneNumber}')`;

                connection.query(userInsertQuery, function (error, results) {
                    if (err) {
                        response.status(500).json(
                            {
                                status: 500,
                                message: "Internal server error",
                            }
                        );
                        throw err;
                    }

                    connection.query(emailAddressQuery, function (error, results, fields) {
                        if (err) {
                            throw err;
                        }

                        if (results.length > 0) {
                            const responseJSON = {
                                status: 201,
                                message: "Created",
                                user: getUserJSON(results[0]),
                            };

                            response.status(201).json(responseJSON);
                        }
                    });
                });
            }

            connection.release();
            if (error) throw error;
        });
    });
};