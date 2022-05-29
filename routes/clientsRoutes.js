const express = require("express");
const clientController = require("../controllers/clientController");
const router = express.Router();

router.post("/", clientController.create_client);

router.get("/", clientController.get_clients_from_user);

router.get("/:id", clientController.get_a_client_from_user);

module.exports = router;
