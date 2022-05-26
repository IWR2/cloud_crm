const express = require("express");
const serviceController = require("../controllers/serviceController");
const router = express.Router();

router.post("/", serviceController.create_service);

router.get("/", serviceController.get_all_services);

module.exports = router;
