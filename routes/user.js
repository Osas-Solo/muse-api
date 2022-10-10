const express = require("express");
const userAPI = require("../api/user");
const router = express.Router();

router.get("/subscription-types", userAPI.getSubscriptionTypes);

module.exports = router;