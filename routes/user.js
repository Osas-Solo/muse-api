const express = require("express");
const userAPI = require("../api/user");
const router = express.Router();

router.get("/subscription-types", userAPI.getSubscriptionTypes);
router.get("/subscription-types/:id", userAPI.getSubscriptionTypeByID);
router.post("/users", userAPI.signup);
router.post("/users/signup", userAPI.signup);
router.post("/users/login", userAPI.login);
router.get("/users/:userID/subscriptions", userAPI.getSubscriptions);
router.get("/users/:userID/subscriptions/:id", userAPI.getSubscriptionByID);

module.exports = router;