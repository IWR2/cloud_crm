const express = require("express");
const serviceController = require("../controllers/serviceController");
const router = express.Router();

router.post("/", serviceController.create_service);

module.exports = router;
