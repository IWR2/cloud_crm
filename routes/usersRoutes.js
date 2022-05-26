const express = require("express");
const userController = require("../controllers/userController");
const router = express.Router();

router.get("/", userController.get_all_users);

router.post("/", (req, res) => {
  res.set("Accept", "POST");
  res
    .status(405)
    .json({
      Error: "Method not allowed",
    })
    .end();
});

router.delete("/", (req, res) => {
  res.set("Accept", "DELETE");
  res
    .status(405)
    .json({
      Error: "Method not allowed",
    })
    .end();
});

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
