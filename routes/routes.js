const express = require("express");

const oauthController = require("../controllers/oauthController");
const userController = require("../controllers/userController");
const router = express.Router();

router.get("/", oauthController.index);

router.get("/authorize", oauthController.authorize);

router.get("/oauth", oauthController.oauth);

router.get("/users", userController.get_all_users);

module.exports = router;
