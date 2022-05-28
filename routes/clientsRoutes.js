const express = require("express");
const clientController = require("../controllers/clientController");
const router = express.Router();

router.post("/", clientController.create_client);

module.exports = router;
