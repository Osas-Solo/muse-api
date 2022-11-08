const database = require("../config/database");
const jwt = require("jsonwebtoken");

exports.getSubscriptionTypes = (request, response) => {
    database.getConnection(function (error, connection) {
        if (error) {
            response.status(500).json(
                {
                    status: 500,
                    message: "Internal server error",
                    error: "Sorry, an error occurred while retrieving the subscription plans. Please try again later.",
                }
            );
            throw error;
        }

        const subscriptionTypesQuery = "SELECT * FROM subscription_types ORDER BY subscription_type_id";

        connection.query(subscriptionTypesQuery, function (error, results, fields) {
            if (error) {
                response.status(500).json(
                    {
                        status: 500,
                        message: "Internal server error",
                        error: "Sorry, an error occurred while retrieving the subscription plans. Please try again later.",
                    }
                );
                throw error;
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

            console.log(responseJSON);
            response.status(200).json(responseJSON);

            connection.release();
            if (error) {
                response.status(500).json(
                    {
                        status: 500,
                        message: "Internal server error",
                        error: "Sorry, an error occurred while retrieving the subscription plans. Please try again later.",
                    }
                );
                throw error;
            }
        });
    });
};

exports.getSubscriptionTypeByID = (request, response) => {
    const subscriptionTypeID = request.params.id;

    database.getConnection(function (error, connection) {
        if (error) {
            response.status(500).json(
                {
                    status: 500,
                    message: "Internal server error",
                    error: `Sorry, an error occurred while retrieving the subscription plan with the ID: ${subscriptionTypeID}. Please try again later.`,
                }
            );
            throw error;
        }

        const subscriptionTypeQuery = `SELECT *
                                       FROM subscription_types
                                       WHERE subscription_type_id = ${subscriptionTypeID}`;

        connection.query(subscriptionTypeQuery, function (error, results, fields) {
            if (error) {
                response.status(500).json(
                    {
                        status: 500,
                        message: "Internal server error",
                        error: `Sorry, an error occurred while retrieving the subscription plan with the ID: ${subscriptionTypeID}. Please try again later.`,
                    }
                );
                throw error;
            }

            if (results.length === 0) {
                const responseJSON = {
                    status: 404,
                    message: "Not found",
                    error: `Sorry, no subscription type with the ID: ${subscriptionTypeID} could be found`,
                };

                console.log(responseJSON);
                response.status(404).json(responseJSON);
            } else {
                const responseJSON = {
                    status: 200,
                    message: "OK",
                    subscriptionType: getCurrentSubscriptionTypeJSON(results[0]),
                };

                console.log(responseJSON);
                response.status(200).json(responseJSON);
            }

            connection.release();
            if (error) {
                response.status(500).json(
                    {
                        status: 500,
                        message: "Internal server error",
                        error: `Sorry, an error occurred while retrieving the subscription plan with the ID: ${subscriptionTypeID}. Please try again later.`,
                    }
                );
                throw error;
            }
        });
    });
};

function getCurrentSubscriptionTypeJSON(currentSubscriptionType) {
    return {
        subscriptionTypeID: currentSubscriptionType.subscription_type_id,
        subscriptionCode: currentSubscriptionType.subscription_code,
        subscriptionName: currentSubscriptionType.subscription_name,
        price: currentSubscriptionType.price,
        numberOfSongs: currentSubscriptionType.number_of_songs,
    };
}

exports.login = (request, response) => {
    const emailAddress = request.body.emailAddress;
    const password = request.body.password;

    database.getConnection(function (error, connection) {
        if (error) {
            response.status(500).json(
                {
                    status: 500,
                    message: "Internal server error",
                    error: `Sorry, an error occurred while trying to login. Please try again later.`,
                }
            );
            throw error;
        }

        const emailAddressQuery = `SELECT *
                                   FROM users
                                   WHERE email_address = '${emailAddress}'`;

        connection.query(emailAddressQuery, function (error, results, fields) {
            if (error) {
                response.status(500).json(
                    {
                        status: 500,
                        message: "Internal server error",
                        error: `Sorry, an error occurred while trying to login. Please try again later.`,
                    }
                );
                throw error;
            }

            if (results.length === 0) {
                const responseJSON = {
                    status: 401,
                    message: "Unauthorised",
                    error: `Sorry, no user account with the email address: ${emailAddress} could be found. Please signup if you haven't yet.`,
                };

                console.log(responseJSON);
                response.status(401).json(responseJSON);
            } else {
                const passwordQuery = `SELECT *
                                       FROM users
                                       WHERE email_address = '${emailAddress}'
                                         AND password = SHA(SHA('${password}'))`;

                connection.query(passwordQuery, function (error, results, fields) {
                    if (error) {
                        response.status(500).json(
                            {
                                status: 500,
                                message: "Internal server error",
                                error: `Sorry, an error occurred while trying to login. Please try again later.`,
                            }
                        );
                        throw error;
                    }

                    if (results.length === 0) {
                        const responseJSON = {
                            status: 401,
                            message: "Unauthorised",
                            error: "Sorry, the password you have entered is incorrect.",
                        };

                        console.log(responseJSON);
                        response.status(401).json(responseJSON);
                    } else {
                        const responseJSON = {
                            status: 200,
                            message: "OK",
                            user: null,
                            sessionToken: null,
                        };

                        setUserJSON(results[0], (userJSON) => {
                            responseJSON.user = userJSON;

                            const loggedInUser = responseJSON.user;

                            jwt.sign(loggedInUser, process.env.JWT_SECRET_KEY, {expiresIn: "1h"}, (error, token) => {
                                responseJSON.sessionToken = token;

                                console.log(responseJSON);
                                response.status(200).json(responseJSON);
                            })
                        });
                    }
                });
            }

            connection.release();
            if (error) {
                response.status(500).json(
                    {
                        status: 500,
                        message: "Internal server error",
                        error: `Sorry, an error occurred while trying to login. Please try again later.`,
                    }
                );
                throw error;
            }
        });
    });
};

exports.getUserProfile = (request, response) => {
    const userID = request.params.userID;

    database.getConnection(function (error, connection) {
        if (error) {
            response.status(500).json(
                {
                    status: 500,
                    message: "Internal server error",
                    error: `Sorry, an error occurred while trying to retrieve your profile. Please try again later.`,
                }
            );
            throw error;
        }

        const userQuery = `SELECT *
                           FROM users
                           WHERE user_id = ${userID}`;

        connection.query(userQuery, function (error, results, fields) {
            if (error) {
                response.status(500).json(
                    {
                        status: 500,
                        message: "Internal server error",
                        error: `Sorry, an error occurred while trying to retrieve your profile. Please try again later.`,
                    }
                );
                throw error;
            }

            if (results.length === 0) {
                const responseJSON = {
                    status: 404,
                    message: "Not found",
                    error: `Sorry, no user with the ID: ${userID} could be found.`,
                };

                console.log(responseJSON);
                response.status(404).json(responseJSON);
            } else {
                const responseJSON = {
                    status: 200,
                    message: "OK",
                    user: null,
                };

                setUserJSON(results[0], (userJSON) => {
                    responseJSON.user = userJSON;

                    console.log(responseJSON);
                    response.status(200).json(responseJSON);
                });
            }

            connection.release();
            if (error) {
                response.status(500).json(
                    {
                        status: 500,
                        message: "Internal server error",
                        error: `Sorry, an error occurred while trying to retrieve your profile. Please try again later.`,
                    }
                );
                throw error;
            }
        });
    });
};

function setUserJSON(user, retrieveUserJSON) {
    let userJSON = {
        userID: user.user_id,
        emailAddress: user.email_address,
        fullName: user.first_name.toUpperCase() + " " + user.last_name.toUpperCase(),
        gender: (user.gender === 'M') ? "Male" : "Female",
        phoneNumber: user.phone_number,
        signupDate: user.join_date,
        currentSubscription: user.current_subscription,
    };

    if (userJSON.currentSubscription != null) {
        setSubscriptionJSON(userJSON.currentSubscription, userJSON.userID, (subscriptionJSON) => {
            userJSON.currentSubscription = subscriptionJSON;

            return retrieveUserJSON(userJSON);
        });
    } else {
        return retrieveUserJSON(userJSON);
    }
}

function setSubscriptionJSON(subscriptionID, userID, retrieveSubscriptionJSON) {
    let subscriptionJSON = {
        subscriptionID: null,
        transactionReference: null,
        subscriptionType: null,
        numberOfRecognisedSongs: null,
        numberOfSongsLeft: null,
        subscriptionDate: null,
        pricePaid: null,
    };

    database.getConnection(function (error, connection) {
        if (error) throw error;

        const subscriptionQuery = `SELECT *
                                   FROM subscriptions s
                                            INNER JOIN subscription_types t ON s.subscription_type_id = t.subscription_type_id
                                   WHERE subscription_id = ${subscriptionID}
                                     AND user_id = ${userID}`;

        connection.query(subscriptionQuery, function (error, results, fields) {
            if (error) {
                throw error;
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

            return retrieveSubscriptionJSON(subscriptionJSON);
        });
    });
}

exports.signup = (request, response) => {
    const emailAddress = request.body.emailAddress;
    const password = request.body.password;
    const passwordConfirmer = request.body.passwordConfirmer;
    const firstName = request.body.firstName;
    const lastName = request.body.lastName;
    const gender = request.body.gender;
    const phoneNumber = request.body.phoneNumber;

    const signupErrors = checkSignupDetails(emailAddress, password, passwordConfirmer, firstName, lastName, gender, phoneNumber);

    if (Object.values(signupErrors).every((signupDetailError) => signupDetailError === null)) {
        database.getConnection(function (error, connection) {
            if (error) {
                response.status(500).json(
                    {
                        status: 500,
                        message: "Internal server error",
                        error: `Sorry, an error occurred while trying to signup. Please try again later.`,
                    }
                );
                throw error;
            }

            const emailAddressQuery = `SELECT *
                                       FROM users
                                       WHERE email_address = '${emailAddress}'`;

            connection.query(emailAddressQuery, function (error, results, fields) {
                if (error) {
                    response.status(500).json(
                        {
                            status: 500,
                            message: "Internal server error",
                            error: `Sorry, an error occurred while trying to signup. Please try again later.`,
                        }
                    );
                    throw error;
                }

                if (results.length > 0) {
                    const responseJSON = {
                        status: 401,
                        message: "Unauthorised",
                        error: `Sorry, there is already a user account with the email address: ${emailAddress}. Please login instead if you have previously signed up.`,
                    };

                    console.log(responseJSON);
                    response.status(401).json(responseJSON);
                } else {
                    const userInsertQuery = `INSERT INTO users (email_address, password, first_name, last_name, gender, phone_number)
                                                 VALUE ('${emailAddress}', SHA(SHA('${password}')), '${firstName}',
                                                        '${lastName}', '${gender}', '${phoneNumber}')`;

                    connection.query(userInsertQuery, function (error, results) {
                        if (error) {
                            response.status(500).json(
                                {
                                    status: 500,
                                    message: "Internal server error",
                                    error: `Sorry, an error occurred while trying to signup. Please try again later.`,
                                }
                            );
                            throw error;
                        }

                        connection.query(emailAddressQuery, function (error, results, fields) {
                            if (error) {
                                response.status(500).json(
                                    {
                                        status: 500,
                                        message: "Internal server error",
                                        error: `Sorry, an error occurred while trying to signup. Please try again later.`,
                                    }
                                );
                                throw error;
                            }

                            if (results.length > 0) {
                                const responseJSON = {
                                    status: 201,
                                    message: "Created",
                                    user: null,
                                };

                                setUserJSON(results[0], (userJSON) => {
                                    responseJSON.user = userJSON;

                                    console.log(responseJSON);
                                    response.status(201).json(responseJSON);
                                });
                            }
                        });
                    });
                }

                connection.release();
                if (error) {
                    response.status(500).json(
                        {
                            status: 500,
                            message: "Internal server error",
                            error: `Sorry, an error occurred while trying to signup. Please try again later.`,
                        }
                    );
                    throw error;
                }
            });
        });
    } else {
        const responseJSON = {
            status: 401,
            message: "Unauthorised",
            error: signupErrors,
        };

        console.log(responseJSON);
        response.status(401).json(responseJSON);
    }
};

function checkSignupDetails(emailAddress, password, passwordConfirmer, firstName, lastName, gender, phoneNumber) {
    const errors = {
        emailAddressError: null,
        passwordError: null,
        passwordConfirmerError: null,
        firstNameError: null,
        lastNameError: null,
        genderError: null,
        phoneNumberError: null,
    };

    if (!isEmailAddressValid(emailAddress)) {
        errors.emailAddressError = "Please enter a valid email address.";
    }

    if (!isPasswordValid(password)) {
        errors.passwordError = "Please enter a valid password. A valid password should have at least one uppercase, one lowercase and one digit. It should also contain at least 8 characters and cannot have more than 20 characters.";
    }

    if (!isPasswordConfirmed(password, passwordConfirmer)) {
        errors.passwordConfirmerError = "Please re-enter your password in the confirm password textfield.";
    }

    if (!isNameValid(firstName)) {
        errors.firstNameError = "Please enter your first name.";
    }

    if (!isNameValid(lastName)) {
        errors.lastNameError = "Please enter your last name.";
    }

    if (!isGenderValid(gender)) {
        errors.genderError = "Please select your gender.";
    }

    if (!isPhoneNumberValid(phoneNumber)) {
        errors.phoneNumberError = "Please enter a valid phone number. A valid phone number should follow the format: 08012345678.";
    }

    return errors;
}

function isEmailAddressValid(emailAddress) {
    const emailAddressRegex = /^[A-Za-z0-9+_.-]+@(.+\..+)$/;

    return emailAddressRegex.test(emailAddress);
}

function isPasswordValid(password) {
    const uppercaseRegex = /[A-Z]/;
    const lowercaseRegex = /[a-z]/;
    const digitRegex = /[0-9]/;

    return uppercaseRegex.test(password) && lowercaseRegex.test(password) && digitRegex.test(password) &&
        password.length >= 8 && password.length <= 20;
}

function isPasswordConfirmed(password, passwordConfirmer) {
    return password === passwordConfirmer;
}

function isNameValid(name) {
    const nameRegex = /^[A-Za-z]+$/;

    return nameRegex.test(name);
}

function isGenderValid(gender) {
    gender = gender.toUpperCase();

    return gender === 'M' || gender === 'F';
}

function isPhoneNumberValid(phoneNumber) {
    const phoneNumberRegex = /^0[7-9][0|1][0-9]{8}$/;

    return phoneNumberRegex.test(phoneNumber);
}

exports.getSubscriptionByID = (request, response) => {
    const subscriptionID = request.params.id;
    const userID = request.params.userID;

    database.getConnection(function (error, connection) {
        if (error) {
            response.status(500).json(
                {
                    status: 500,
                    message: "Internal server error",
                    error: `Sorry, an error occurred while retrieving the subscription with the ID: ${subscriptionTypeID}.`,
                }
            );
            throw error;
        }

        const subscriptionQuery = `SELECT *
                                   FROM subscriptions
                                   WHERE subscription_id = '${subscriptionID}'
                                     AND user_id = '${userID}'`;

        connection.query(subscriptionQuery, function (error, results, fields) {
            if (error) {
                response.status(500).json(
                    {
                        status: 500,
                        message: "Internal server error",
                        error: `Sorry, an error occurred while retrieving the subscription with the ID: ${subscriptionTypeID}.`,
                    }
                );
                throw error;
            }

            if (results.length > 0) {
                const responseJSON = {
                    status: 200,
                    message: "OK",
                    subscription: null,
                };

                setSubscriptionJSON(results[0].subscription_id, results[0].user_id, (subscriptionJSON) => {
                    responseJSON.subscription = subscriptionJSON;

                    console.log(responseJSON);
                    response.status(200).json(responseJSON);
                });
            }

            connection.release();
            if (error) {
                response.status(500).json(
                    {
                        status: 500,
                        message: "Internal server error",
                        error: `Sorry, an error occurred while retrieving the subscription with the ID: ${subscriptionTypeID}.`,
                    }
                );
                throw error;
            }
        });
    });
}

exports.getSubscriptions = (request, response) => {
    const userID = request.params.userID;

    database.getConnection(function (error, connection) {
        if (error) {
            response.status(500).json(
                {
                    status: 500,
                    message: "Internal server error",
                    error: `Sorry, an error occurred while retrieving your previous subscriptions. Please try again later`,
                }
            );
            throw error;
        }

        const subscriptionsQuery = `SELECT *
                                    FROM subscriptions s
                                             INNER JOIN subscription_types t ON s.subscription_type_id = t.subscription_type_id
                                    WHERE user_id = ${userID}
                                    ORDER BY subscription_id DESC`;

        connection.query(subscriptionsQuery, function (error, results, fields) {
            if (error) {
                response.status(500).json(
                    {
                        status: 500,
                        message: "Internal server error",
                        error: `Sorry, an error occurred while retrieving your previous subscriptions. Please try again later`,
                    }
                );
                throw error;
            }

            let responseJSON = {
                status: 200,
                message: "OK",
                subscriptions: [],
                total: results.length,
            };

            if (results.length > 0) {
                for (const currentSubscription of results) {
                    let subscriptionJSON = {
                        subscriptionID: null,
                        transactionReference: null,
                        subscriptionType: null,
                        numberOfRecognisedSongs: null,
                        numberOfSongsLeft: null,
                        subscriptionDate: null,
                        pricePaid: null,
                    };

                    subscriptionJSON.subscriptionID = currentSubscription.subscription_id;
                    subscriptionJSON.transactionReference = currentSubscription.transaction_reference;
                    subscriptionJSON.subscriptionType = currentSubscription.subscription_name;
                    subscriptionJSON.numberOfRecognisedSongs = currentSubscription.number_of_recognised_songs;
                    subscriptionJSON.numberOfSongsLeft = currentSubscription.number_of_songs - results[0].number_of_recognised_songs;
                    subscriptionJSON.subscriptionDate = currentSubscription.subscription_date;
                    subscriptionJSON.pricePaid = currentSubscription.price_paid;

                    responseJSON.subscriptions.push(subscriptionJSON);
                }
            }

            console.log(responseJSON);
            response.status(200).json(responseJSON);

            connection.release();
            if (error) {
                response.status(500).json(
                    {
                        status: 500,
                        message: "Internal server error",
                        error: `Sorry, an error occurred while retrieving your previous subscriptions. Please try again later`,
                    }
                );
                throw error;
            }
        });
    });
};

exports.paySubscription = (request, response) => {
    const userID = request.params.userID;
    const transactionReference = request.body.transactionReference;
    const subscriptionTypeID = request.body.subscriptionType;
    const amountPaid = request.body.amountPaid;

    database.getConnection(function (error, connection) {
        if (error) {
            response.status(500).json(
                {
                    status: 500,
                    message: "Internal server error",
                    error: `Sorry, an error occurred while trying to pay subscription. Please try again later`,
                }
            );
            throw error;
        }

        const subscriptionInsertQuery = `INSERT INTO subscriptions
                                             (transaction_reference, subscription_type_id, user_id, price_paid) VALUE
                                             ('${transactionReference}', ${subscriptionTypeID}, ${userID},
                                              ${amountPaid})`;

        connection.query(subscriptionInsertQuery, function (error, results, fields) {
            if (error) {
                response.status(500).json(
                    {
                        status: 500,
                        message: "Internal server error",
                        error: `Sorry, an error occurred while trying to pay subscription. Please try again later`,
                    }
                );
                throw error;
            }

            let responseJSON = {
                status: 200,
                message: "OK",
                subscription: null,
            };

            const currentSubscriptionQuery = `SELECT *
                                              FROM subscriptions
                                              WHERE user_id = ${userID}
                                              ORDER BY subscription_id DESC`;

            connection.query(currentSubscriptionQuery, function (error, results, fields) {
                if (error) {
                    response.status(500).json(
                        {
                            status: 500,
                            message: "Internal server error",
                            error: `Sorry, an error occurred while trying to pay subscription. Please try again later`,
                        }
                    );
                    throw error;
                }

                if (results.length > 0) {
                    setSubscriptionJSON(results[0].subscription_id, results[0].user_id, (subscriptionJSON) => {
                        responseJSON.subscription = subscriptionJSON;

                        console.log(responseJSON);
                        response.status(200).json(responseJSON);

                        const currentSubscriptionID = results[0].subscription_id;

                        const currentSubscriptionUpdateQuery = `UPDATE users
                                                                SET current_subscription = ${currentSubscriptionID}
                                                                WHERE user_id = ${userID}`;

                        connection.query(currentSubscriptionUpdateQuery, function (error, results, fields) {
                            if (error) {
                                response.status(500).json(
                                    {
                                        status: 500,
                                        message: "Internal server error",
                                        error: `Sorry, an error occurred while trying to pay subscription. Please try again later`,
                                    }
                                );
                                throw error;
                            }
                        });
                    });
                }
            });

            connection.release();
            if (error) {
                response.status(500).json(
                    {
                        status: 500,
                        message: "Internal server error",
                        error: `Sorry, an error occurred while trying to pay subscription. Please try again later`,
                    }
                );
                throw error;
            }
        });
    });
};

exports.updateSubscription = (request, response) => {
    const userID = request.params.userID;
    const subscriptionID = request.params.id;
    const numberOfNewlyRecognisedSongs = request.body.numberOfNewlyRecognisedSongs;

    database.getConnection(function (error, connection) {
        if (error) {
            response.status(500).json(
                {
                    status: 500,
                    message: "Internal server error",
                    error: `Sorry, an error occurred while trying to update subscription details. Please try again later`,
                }
            );
            throw error;
        }

        const subscriptionUpdateQuery = `UPDATE subscriptions
                                         SET number_of_recognised_songs = number_of_recognised_songs + ${numberOfNewlyRecognisedSongs}
                                         WHERE subscription_id = ${subscriptionID}
                                           AND user_id = ${userID}`;

        connection.query(subscriptionUpdateQuery, function (error, results, fields) {
            if (error) {
                response.status(500).json(
                    {
                        status: 500,
                        message: "Internal server error",
                        error: `Sorry, an error occurred while trying to update subscription details. Please try again later`,
                    }
                );
                throw error;
            }

            let responseJSON = {
                status: 200,
                message: "OK",
                subscription: null,
            };

            const currentSubscriptionQuery = `SELECT *
                                              FROM subscriptions
                                              WHERE subscription_id = ${subscriptionID}`;

            connection.query(currentSubscriptionQuery, function (error, results, fields) {
                if (error) {
                    response.status(500).json(
                        {
                            status: 500,
                            message: "Internal server error",
                            error: `Sorry, an error occurred while trying to update subscription details. Please try again later`,
                        }
                    );
                    throw error;
                }

                if (results.length > 0) {
                    setSubscriptionJSON(results[0].subscription_id, results[0].user_id, (subscriptionJSON) => {
                        responseJSON.subscription = subscriptionJSON;

                        console.log(responseJSON);
                        response.status(200).json(responseJSON);

                        if (responseJSON.subscription.numberOfSongsLeft <= 0) {
                            const currentSubscriptionUpdateQuery = `UPDATE users
                                                                    SET current_subscription = null
                                                                    WHERE user_id = ${userID}`;

                            connection.query(currentSubscriptionUpdateQuery, function (error, results, fields) {
                                if (error) {
                                    response.status(500).json(
                                        {
                                            status: 500,
                                            message: "Internal server error",
                                            error: `Sorry, an error occurred while trying to update subscription details. Please try again later`,
                                        }
                                    );
                                    throw error;
                                }
                            });
                        }
                    });
                }
            });

            connection.release();
            if (error) {
                response.status(500).json(
                    {
                        status: 500,
                        message: "Internal server error",
                        error: `Sorry, an error occurred while trying to update subscription details. Please try again later`,
                    }
                );
                throw error;
            }
        });
    });
};