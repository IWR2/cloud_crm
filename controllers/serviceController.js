const service_ds = require("../datastore/services");

/* Gets all users from the datastore */
const create_service = (req, res) => {
  // Check that the content-type from the client is in app/json
  if (req.get("content-type") !== "application/json") {
    // It's not, reject it with status 415
    res
      .status(415)
      .send({ Error: "Server only accepts application/json data" })
      .end();
    return;
  }

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
            "The request object includes at least one unsupported attribute",
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

/**
 * Gets a list of all services with a limit of 5 services per page. It
 * provides a link to the next 5 services per page. The last page does
 * not have an next link.
 * @param {Object} req Request query to check if there is a cursor key.
 * If the request and response are not application/json, it
 * returns status 406.
 * If the client accepts application/json, the server returns a JSON
 * of all the services and status 200.
 */
const get_all_services = (req, res) => {
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
  const services = service_ds.get_services(req).then((services) => {
    res.status(200).json(services);
  });
};

module.exports = {
  create_service,
  get_all_services,
};
