const express = require("express");
const clientController = require("../controllers/clientController");
const router = express.Router();

router.post("/", clientController.create_client);

router.get("/", clientController.get_clients_from_user);

router.get("/:id", clientController.get_a_client_from_user);

router.put("/:id", clientController.replace_a_client);

router.patch("/:id", clientController.update_a_client);

router.put("/", (req, res) => {
  res.set("Accept", "PUT");
  res
    .status(405)
    .json({
      Error: "Method not allowed",
    })
    .end();
});

router.patch("/", (req, res) => {
  res.set("Accept", "PATCH");
  res
    .status(405)
    .json({
      Error: "Method not allowed",
    })
    .end();
});

module.exports = router;
