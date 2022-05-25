const express = require("express");

const oauthController = require("../controllers/oauthController");
const router = express.Router();

router.get("/", oauthController.index);

router.get("/authorize", oauthController.authorize);

router.get("/oauth", oauthController.oauth);

module.exports = router;
