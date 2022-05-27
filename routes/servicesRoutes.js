const express = require("express");
const serviceController = require("../controllers/serviceController");
const router = express.Router();

router.post("/", serviceController.create_service);

router.get("/", serviceController.get_all_services);

router.get("/:id", serviceController.get_a_service);

router.put("/:id", serviceController.replace_a_service);

router.put("/", (req, res) => {
  res.set("Accept", "PUT");
  res
    .status(405)
    .json({
      Error: "Method not allowed",
    })
    .end();
});

module.exports = router;
