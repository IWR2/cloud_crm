const service_ds = require("../datastore/services");

const client_ds = require("../datastore/clients");

/**
 * Creates a new service and adds it to the Datastore.
 * @param {Object} req Attributes of a service.
 * @param {Object} res JSON representation of the newly created
 * service with its self link.
 * If the service is created, it returns status 201 and a JSON
 * representation of the newly created service with its self link.
 * If any of the 3 required attributes are missing, not the
 * correct datatype, or not valid, it returns status 400.
 * If the response is not application/json, it returns status 406.
 * If the client sends an unsupported MIME type that is not JSON,
 * it returns status 415.
 */
const create_service = (req, res) => {
  if (req.get("content-type") !== "application/json") {
    res
      .status(415)
      .send({ Error: "Server only accepts application/json data" })
      .end();
    return;
  }

  const accepts = req.accepts(["application/json"]);
  if (!accepts) {
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
          client: new_service.data.client,
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
 * Returns a list of all services with a limit of 5 services per page. It
 * provides a link to the next 5 services per page. The last page does
 * not have an next link.
 * @param {Object} req Request query to check if there is a cursor key
 * for the next page of services.
 * @param {Object} res JSON response of an array of services.
 * If the client accepts application/json, the server returns a JSON
 * of all the services and status 200.
 * If the client does not accept application/json, it returns status
 * 406.
 */
const get_all_services = (req, res) => {
  const accepts = req.accepts(["application/json"]);
  if (!accepts) {
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
 * Returns a JSON representation of a service from the Datastore.
 * @param {String} req ID of a service.
 * @param {Object} res JSON representation of the service's attributes.
 * If the service does not exist, it returns a 404 status.
 * If the response is not application/json, it
 * returns status 406.
 */
const get_a_service = (req, res) => {
  const accepts = req.accepts(["application/json"]);
  if (!accepts) {
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
          client: service[0].client,
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
 * Replaces all attributes of a service. The service retains any existing
 * associations to a client.
 * @param {Object} req Attributes of a service.
 * @param {Object} res JSON representation of the replaced  service
 * with its self link.
 * If the service is updated, it returns a JSON representation of the
 * service with the service's self link and status 201.
 * If all or any attributes are missing, price is not a number, price
 * is non-negative, or includes an unsupported attribute, it returns
 * status 400.
 * If the request contains an id or client, it returns status 403.
 * If the service does not exist, it returns status 404.
 * If the client does not accept application/json, it returns status
 * 406.
 * If the client sends an unsupported MIME type that is not JSON,
 * it returns status 415.
 */
const replace_a_service = (req, res) => {
  if (req.get("content-type") !== "application/json") {
    res
      .status(415)
      .send({ Error: "Server only accepts application/json data" })
      .end();
    return;
  }

  const accepts = req.accepts(["application/json"]);
  if (!accepts) {
    res
      .status(406)
      .send({ Error: "Client must accept application/json" })
      .end();
    return;
  }
  service_ds.get_service(req.params.id).then((service) => {
    if (service[0] === undefined || service[0] === null) {
      res
        .status(404)
        .json({ Error: "No service with this service_id exists" })
        .end();
      return;
    } else {
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

        if (attributes.includes("id")) {
          res
            .status(403)
            .json({
              Error: "service_id cannot be modified",
            })
            .end();
          return;
        }

        if (attributes.includes("client")) {
          res
            .status(403)
            .json({
              Error: "client cannot be modified",
            })
            .end();
          return;
        }

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
          .put_service(
            req.params.id,
            req.body.name,
            req.body.type,
            req.body.price,
            service[0].client
          )
          .then((new_service) => {
            new_service[0].self =
              req.protocol +
              `://${req.get("host")}` +
              `${req.baseUrl}/` +
              `${new_service[0].id}`;
            res.status(201).send({
              id: new_service[0].id,
              name: new_service[0].name,
              type: new_service[0].type,
              price: new_service[0].price,
              client: new_service[0].client,
              self: new_service[0].self,
            });
          });
      }
    }
  });
};

/**
 * Edits any subset of attributes of a service except for clients.
 * @param {Object} req Attributes of a service.
 * @param {Object} res JSON representation of the updated service with
 * its self link.
 * If the service is updated, it returns a JSON representation of the
 * service with the service's self link and status 200.
 * If all attributes are missing, price is not a number, price
 * is non-negative, or includes an unsupported attribute, it returns
 * status 400.
 * If the request contains an id or client, it returns status 403.
 * If the service does not exist, it returns status 404
 * If the client does not accept application/json, it returns status
 * 406.
 * If the client sends an unsupported MIME type that is not JSON,
 * it returns status 415.
 */
const update_a_service = (req, res) => {
  if (req.get("content-type") !== "application/json") {
    res
      .status(415)
      .send({ Error: "Server only accepts application/json data" })
      .end();
    return;
  }
  const accepts = req.accepts(["application/json"]);

  if (!accepts) {
    res
      .status(406)
      .send({ Error: "Client must accept application/json" })
      .end();
    return;
  }

  service_ds.get_service(req.params.id).then((service) => {
    if (service[0] === undefined || service[0] === null) {
      res
        .status(404)
        .json({ Error: "No service with this service_id exists" })
        .end();
      return;
    } else {
      const keys = ["name", "type", "price"];
      const attributes = Object.keys(req.body);

      if (attributes.length === 0) {
        res
          .status(400)
          .json({
            Error:
              "The request object must include at least one supported attribute",
          })
          .end();
        return;
      }

      if (attributes.includes("id")) {
        res
          .status(403)
          .json({
            Error: "service_id cannot be modified",
          })
          .end();
        return;
      }

      if (attributes.includes("client")) {
        res
          .status(403)
          .json({
            Error: "client cannot be modified",
          })
          .end();
        return;
      }

      // Check for invalid keys
      for (let i = 0; i < attributes.length; i++) {
        if (!keys.includes(attributes[i])) {
          res
            .status(400)
            .json({
              Error:
                "The request object includes at least one unsupported attribute",
            })
            .end();
          return;
        }
      }

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

      let current_service = {
        id: service[0].id,
        name: service[0].name,
        type: service[0].type,
        price: service[0].price,
        client: service[0].client,
      };

      if (attributes.includes("name")) {
        current_service.name = req.body.name;
      }

      if (attributes.includes("type")) {
        current_service.type = req.body.type;
      }

      if (attributes.includes("price")) {
        if (req.body.price < 0 || typeof req.body.price != "number") {
          res
            .status(400)
            .json({
              Error: "The price attribute must be a non-negative number",
            })
            .end();
          return;
        }
        current_service.price = req.body.price;
      }

      service_ds
        .put_service(
          current_service.id,
          current_service.name,
          current_service.type,
          current_service.price,
          current_service.client
        )
        .then((updated_service) => {
          res.status(200).send({
            id: updated_service[0].id,
            name: updated_service[0].name,
            type: updated_service[0].type,
            price: updated_service[0].price,
            client: updated_service[0].client,
            self:
              req.protocol +
              `://${req.get("host")}` +
              `${req.baseUrl}/` +
              `${updated_service[0].id}`,
          });
        });
    }
  });
};

/**
 * Deletes a service from the Datastore.
 * @param {String} req.id ID of the service to delete.
 * If the service exists, it returns status 204.
 * If the service does not exist, it returns status 404.
 */
const delete_a_service = (req, res) => {
  service_ds.get_service(req.params.id).then((service) => {
    if (service[0] === undefined || service[0] === null) {
      res
        .status(404)
        .json({ Error: "No service with this service_id exists" })
        .end();
    } else {
      // Check if the load has a carrier
      if (service[0].client != null) {
        client_ds.get_client(service[0].client).then((client) => {
          // remove that service from the client's services
          for (let i = 0; i < client[0].services.length; i++) {
            client[0].services.splice(i, 1);
          }
          // Update the client
          client_ds.put_client(
            client[0].id,
            client[0].name,
            client[0].contact_manager,
            client[0].email,
            client[0].services,
            client[0].owner
          );
        });
      }
      service_ds.delete_service(req.params.id).then(() => {
        res.status(204).end();
      });
    }
  });
};

module.exports = {
  create_service,
  get_all_services,
  get_a_service,
  replace_a_service,
  update_a_service,
  delete_a_service,
};
