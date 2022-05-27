const service_ds = require("../datastore/services");

/**
 * Creates a new service and adds it to the Datastore, and returns a
 * status 201 and a JSON representation of the newly created service
 * with its self link.
 * @param {Object} req Attributes of a service.
 * @param {Object} res JSON represemtation of the newly created
 * service with its self link.
 * If the client sends an unsupported MIME type that is not JSON,
 * it returns status 415.
 * If the request and response are not application/json, it
 * returns status 406.
 * If any of the 3 required attributes are missing, not the
 * correct datatype, or not valid, it returns status 400.
 */
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
 * @param {Object} res JSON response of an array of services.
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

/**
 * Gets a service by ID by calling get_service and returns a JSON of
 * the service object with self link and service's attributes and self
 * link.
 * @param {String} req ID of a service to view.
 * @param {Object} res JSON response of the service's attributes.
 * If the service does not exist, it returns a 404 status.
 * If the Accept header is not JSON, it returns status 406.
 */
const get_a_service = (req, res) => {
  const accepts = req.accepts(["application/json"]);
  if (!accepts) {
    // it is False, send back a 406, Not Acceptable
    res
      .status(406)
      .send({ Error: "Client must accept application/json" })
      .end();
    return;
  }
  service_ds.get_service(req.params.id).then((service) => {
    if (service[0] === undefined || service[0] === null) {
      res.status(404).json({ Error: "No service with this service_id exists" });
    } else {
      res
        .status(200)
        .json({
          id: service[0].id,
          name: service[0].name,
          type: service[0].type,
          price: service[0].price,
          self:
            req.protocol +
            `://${req.get("host")}` +
            `${req.baseUrl}/` +
            `${service[0].id}`,
        })
        .end();
    }
  });
};

/**
 * Creates a new service and adds it to the Datastore, and returns a
 * status 201 and a JSON representation of the newly created service
 * with its self link.
 * @param {Object} req Attributes of a service.
 * @param {Object} res JSON represemtation of the newly created
 * service with its self link.
 * If the client sends an unsupported MIME type that is not JSON,
 * it returns status 415.
 * If the request and response are not application/json, it
 * returns status 406.
 * If any of the 3 required attributes are missing, not the
 * correct datatype, or not valid, it returns status 400.
 */
const replace_a_service = (req, res) => {
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
      .put_service(req.params.id, req.body.name, req.body.type, req.body.price)
      .then((new_service) => {
        new_service[0].self =
          req.protocol +
          `://${req.get("host")}` +
          `${req.baseUrl}/` +
          `${new_service[0].id}`;
        // Set the location header and return status 303.
        res.location(new_service[0].self);
        res.status(303).send({
          id: new_service[0].id,
          name: new_service[0].name,
          type: new_service[0].type,
          price: new_service[0].price,
          self: new_service[0].self,
        });
      });
  }
};

module.exports = {
  create_service,
  get_all_services,
  get_a_service,
  replace_a_service,
};
