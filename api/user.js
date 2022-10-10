const express = require("express");
const database = require("../config/database");
const {response, request} = require("express");

exports.getSubscriptionTypes = (request, response) => {
    response.send("Here are your subscriptions");
};