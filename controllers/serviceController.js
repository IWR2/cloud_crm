const service_ds = require("../datastore/services");

/* Gets all users from the datastore */
const create_service = (req, res) => {
  const accepts = req.accepts(["application/json"]);
  // If none of these accepts are provided
  if (!accepts) {
    // it is False, send back a 406, Not Acceptable
    res
      .status(406)
      .send({ Error: "Client must accept application/json" })
      .end();
    return;
  }

  if (
    req.body.name === undefined ||
    req.body.type === undefined ||
    req.body.price === undefined
  ) {
    res
      .status(400)
      .json({
        Error:
          "The request object is missing at least one of the required attributes",
      })
      .end();
  } else {
    const attributes = Object.keys(req.body);

    if (attributes.length > 3) {
      res
        .status(400)
        .json({
          Error:
            "The request object includes at least one not supported attribute",
        })
        .end();
      return;
    }

    if (req.body.price < 0 || typeof req.body.price != "number") {
      res
        .status(400)
        .json({
          Error: "The price attribute must be a non-negative number",
        })
        .end();
      return;
    }
    service_ds
      .post_service(req.body.name, req.body.type, req.body.price)
      .then((new_service) => {
        res.status(201).send({
          id: new_service.key.id,
          name: new_service.data.name,
          type: new_service.data.type,
          price: new_service.data.price,
          self:
            req.protocol +
            `://${req.get("host")}` +
            `${req.baseUrl}/` +
            `${new_service.key.id}`,
        });
      });
  }
};

module.exports = {
  create_service,
};
