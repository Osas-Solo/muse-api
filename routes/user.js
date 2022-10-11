const express = require("express");
const userAPI = require("../api/user");
const router = express.Router();

router.get("/subscription-types", userAPI.getSubscriptionTypes);
router.get("/subscription-types/:id", userAPI.getSubscriptionTypeByID);

module.exports = router;