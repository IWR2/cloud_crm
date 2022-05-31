const axios = require("axios");
const { google } = require("googleapis");
const { OAuth2Client } = require("google-auth-library");

const {
  CLIENT_ID,
  CLIENT_SECRET,
  SCOPE,
  REDIRECT_URL,
} = require("../constants");

const oauth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);

const client_ds = require("../datastore/clients");

const service_ds = require("../datastore/services");

/**
 * Creates a new client and adds it to the Datastore, and returns status
 * 201 and a JSON representation of the newly created client.
 * @param {Object} req Attributes of a client.
 * If the client sends an unsupported MIME type that is not JSON,
 * it returns status 415.
 * If the request and response are not application/json, it
 * returns status 406.
 */
const create_client = (req, res) => {
  let authorization = req.headers["authorization"];
  if (authorization !== undefined) {
    // Get the token value
    let items = authorization.split(/[ ]+/);
    if (items.length > 1 && items[0].trim() == "Bearer") {
      let token = items[1];
      // verify token
      oauth2Client
        .verifyIdToken({
          idToken: token,
          audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        })
        .then((ticket) => {
          const payload = ticket.getPayload();
          const userid = payload["sub"];
          if (req.get("content-type") !== "application/json") {
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
            req.body.contact_manager === undefined ||
            req.body.email === undefined
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

            client_ds
              .post_client(
                req.body.name,
                req.body.contact_manager,
                req.body.email,
                userid
              )
              .then((new_client) => {
                res.status(201).send({
                  id: new_client.key.id,
                  name: new_client.data.name,
                  contact_manager: new_client.data.contact_manager,
                  email: new_client.data.email,
                  services: new_client.data.services,
                  owner: new_client.data.owner,
                  self:
                    req.protocol +
                    `://${req.get("host")}` +
                    `${req.baseUrl}/` +
                    `${new_client.key.id}`,
                });
              });
          }
        })
        .catch((err) => {
          res.status(401).json({ Error: "Missing or invalid JWTs" }).end();
        });
    }
  } else {
    res.status(401).json({ Error: "Missing or invalid JWTs" }).end();
  }
};

/**
 * Returns the list of all clients of a user from the datastore.
 * @param {String} req To retrieve the authorization header.
 * @returns JSON of the list of all clients of a user.
 * If the request and response are not application/json, it
 * returns status 406.
 * If the authorization is undefined or invalid, it sends status 401.
 * If the authorization of the client is correct, it returns status 200
 * and a list of all of the User's clients.
 */
const get_clients_from_user = (req, res) => {
  let authorization = req.headers["authorization"];
  if (authorization !== undefined) {
    // Get the token value
    let items = authorization.split(/[ ]+/);
    if (items.length > 1 && items[0].trim() == "Bearer") {
      let token = items[1];
      // verify token
      oauth2Client
        .verifyIdToken({
          idToken: token,
          audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        })
        .then((ticket) => {
          const payload = ticket.getPayload();
          const userid = payload["sub"];
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
          client_ds.get_clients(req, userid).then((clients) => {
            res.status(200).json(clients);
          });
        })
        .catch((err) => {
          res.status(401).json({ Error: "Missing or invalid JWTs" }).end();
        });
    }
  } else {
    res.status(401).json({ Error: "Missing or invalid JWTs" }).end();
  }
};

/**
 * Returns a client of a user from the datastore.
 * @param {String} req To retrieve the authorization header and ID of a client.
 * @returns JSON of all attributes of a client.
 * If the request and response are not application/json, it
 * returns status 406.
 * If the authorization is undefined or invalid, it sends status 401.
 * If the authorization of the client is correct, it returns status 200
 * and a list of all of the User's clients.
 */
const get_a_client_from_user = (req, res) => {
  let authorization = req.headers["authorization"];
  if (authorization !== undefined) {
    // Get the token value
    let items = authorization.split(/[ ]+/);
    if (items.length > 1 && items[0].trim() == "Bearer") {
      let token = items[1];
      // verify token
      oauth2Client
        .verifyIdToken({
          idToken: token,
          audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        })
        .then((ticket) => {
          const payload = ticket.getPayload();
          const userid = payload["sub"];
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

          if (req.params.id === undefined || req.params.id === null) {
            res
              .status(400)
              .json({
                Error: "client_id must not be null",
              })
              .end();
            return;
          }

          client_ds.get_client(req.params.id).then((client) => {
            if (client[0] === undefined || client[0] === null) {
              res
                .status(404)
                .json({ Error: "No client with this client_id exists" })
                .end();
              return;
            } else if (userid != client[0].owner) {
              res
                .status(403)
                .json({
                  Error:
                    "The user does not have access privileges to this client",
                })
                .end();
            } else {
              const current_services = [];
              // Assign a self link for each service
              for (let i = 0; i < client[0].services.length; i++) {
                current_services.push({
                  id: client[0].services[i].id,
                  self:
                    req.protocol +
                    `://${req.get("host")}` +
                    "/services/" +
                    `${client[0].services[i].id}`,
                });
              }
              res
                .status(200)
                .json({
                  id: client[0].id,
                  name: client[0].name,
                  contact_manager: client[0].contact_manager,
                  email: client[0].email,
                  owner: client[0].owner,
                  services: current_services,
                  self:
                    req.protocol +
                    `://${req.get("host")}` +
                    `${req.baseUrl}/` +
                    `${client[0].id}`,
                })
                .end();
            }
          });
        })
        .catch((err) => {
          res.status(401).json({ Error: "Missing or invalid JWTs" }).end();
        });
    }
  } else {
    res.status(401).json({ Error: "Missing or invalid JWTs" }).end();
  }
};

/**
 * Replaces all attributes of a client. The client retains any existing
 * associations to a service and a user.
 * @param {String} req To retrieve the authorization header and ID of a
 * client and attributes of a client.
 * @returns JSON of all attributes of a client.
 * If the client is updated, it returns status 200 and a JSON
 * representation of the client with the client's self link.
 * If all or any attributes are missing or includes an unsupported
 * attribute, it returns status 400.
 * If the authorization is invalid or missing, it returns status 401.
 * If the request contains an id, service, or owner it returns status
 * 403.
 * If the service does not exist, it returns a 404 status.
 * If the request and response are not application/json, it
 * returns status 406.
 * If the client sends an unsupported MIME type that is not JSON,
 * it returns status 415.
 */
const replace_a_client = (req, res) => {
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

  let authorization = req.headers["authorization"];
  if (authorization !== undefined) {
    // Get the token value
    let items = authorization.split(/[ ]+/);
    if (items.length > 1 && items[0].trim() == "Bearer") {
      let token = items[1];
      // verify token
      oauth2Client
        .verifyIdToken({
          idToken: token,
          audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        })
        .then((ticket) => {
          const payload = ticket.getPayload();
          const userid = payload["sub"];

          if (req.params.id === undefined || req.params.id === null) {
            res
              .status(400)
              .json({
                Error: "client_id must not be null",
              })
              .end();
            return;
          }

          client_ds.get_client(req.params.id).then((client) => {
            if (client[0] === undefined || client[0] === null) {
              res
                .status(404)
                .json({ Error: "No client with this client_id exists" })
                .end();
              return;
            } else if (userid != client[0].owner) {
              res
                .status(403)
                .json({
                  Error:
                    "The user does not have access privileges to this client",
                })
                .end();
            } else {
              if (
                req.body.name === undefined ||
                req.body.contact_manager === undefined ||
                req.body.email === undefined
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
                      Error: "client_id cannot be modified",
                    })
                    .end();
                  return;
                }

                if (attributes.includes("services")) {
                  res
                    .status(403)
                    .json({
                      Error: "services cannot be modified at this end point",
                    })
                    .end();
                  return;
                }

                if (attributes.includes("owner")) {
                  res
                    .status(403)
                    .json({
                      Error: "owner cannot be modified",
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

                const current_services = [];
                // Assign a self link for each service
                for (let i = 0; i < client[0].services.length; i++) {
                  current_services.push({
                    id: client[0].services.id,
                    self:
                      req.protocol +
                      `://${req.get("host")}` +
                      "/services/" +
                      `${client[0].services[i].id}`,
                  });
                }

                client_ds
                  .put_client(
                    client[0].id,
                    req.body.name,
                    req.body.contact_manager,
                    req.body.email,
                    client[0].services,
                    userid
                  )
                  .then((new_client) => {
                    res.status(201).send({
                      id: new_client[0].id,
                      name: new_client[0].name,
                      contact_manager: new_client[0].contact_manager,
                      email: new_client[0].email,
                      services: current_services,
                      owner: new_client[0].owner,
                      self:
                        req.protocol +
                        `://${req.get("host")}` +
                        `${req.baseUrl}/` +
                        `${new_client[0].id}`,
                    });
                  });
              }
            }
          });
        })
        .catch((err) => {
          res.status(401).json({ Error: "Missing or invalid JWTs" }).end();
        });
    }
  } else {
    res.status(401).json({ Error: "Missing or invalid JWTs" }).end();
  }
};

/**
 * Edit any subset of attributes of a client except for services.
 * @param {String} req To retrieve the authorization header and ID of a
 * client and attributes of a client.
 * @returns JSON of all attributes of a client.
 * If the client is updated, it returns status 200 and a JSON
 * representation of the client with the client's self link.
 * If all attributes are missing or includes an unsupported
 * attribute, it returns status 400.
 * If the authorization is invalid or missing, it returns status 401.
 * If the request contains an id, service, or owner it returns status
 * 403.
 * If the service does not exist, it returns a 404 status.
 * If the request and response are not application/json, it
 * returns status 406.
 * If the client sends an unsupported MIME type that is not JSON,
 * it returns status 415.
 */
const update_a_client = (req, res) => {
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

  let authorization = req.headers["authorization"];
  if (authorization !== undefined) {
    // Get the token value
    let items = authorization.split(/[ ]+/);
    if (items.length > 1 && items[0].trim() == "Bearer") {
      let token = items[1];
      // verify token
      oauth2Client
        .verifyIdToken({
          idToken: token,
          audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        })
        .then((ticket) => {
          const payload = ticket.getPayload();
          const userid = payload["sub"];

          if (req.params.id === undefined || req.params.id === null) {
            res
              .status(400)
              .json({
                Error: "client_id must not be null",
              })
              .end();
            return;
          }

          client_ds.get_client(req.params.id).then((client) => {
            if (client[0] === undefined || client[0] === null) {
              res
                .status(404)
                .json({ Error: "No client with this client_id exists" })
                .end();
              return;
            } else if (userid != client[0].owner) {
              res
                .status(403)
                .json({
                  Error:
                    "The user does not have access privileges to this client",
                })
                .end();
            } else {
              const keys = ["name", "email", "contact_manager"];
              // Get the attributes from the request query
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
                    Error: "client_id cannot be modified",
                  })
                  .end();
                return;
              }

              if (attributes.includes("services")) {
                res
                  .status(403)
                  .json({
                    Error: "services cannot be modified at this end point",
                  })
                  .end();
                return;
              }

              if (attributes.includes("owner")) {
                res
                  .status(403)
                  .json({
                    Error: "owner cannot be modified",
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

              let current_client = {
                id: client[0].id,
                name: client[0].name,
                contact_manager: client[0].contact_manager,
                email: client[0].email,
                services: client[0].services,
                owner: client[0].owner,
              };

              const current_services = [];
              // Assign a self link for each service
              for (let i = 0; i < client[0].services.length; i++) {
                current_services.push({
                  id: client[0].services.id,
                  self:
                    req.protocol +
                    `://${req.get("host")}` +
                    "/services/" +
                    `${client[0].services[i].id}`,
                });
              }

              if (attributes.includes("name")) {
                current_client.name = req.body.name;
              }

              if (attributes.includes("contact_manager")) {
                current_client.contact_manager = req.body.contact_manager;
              }

              if (attributes.includes("email")) {
                current_client.email = req.body.email;
              }

              client_ds
                .put_client(
                  current_client.id,
                  current_client.name,
                  current_client.contact_manager,
                  current_client.email,
                  current_client.services,
                  userid
                )
                .then((new_client) => {
                  res.status(200).send({
                    id: new_client[0].id,
                    name: new_client[0].name,
                    contact_manager: new_client[0].contact_manager,
                    email: new_client[0].email,
                    services: current_services,
                    owner: new_client[0].owner,
                    self:
                      req.protocol +
                      `://${req.get("host")}` +
                      `${req.baseUrl}/` +
                      `${new_client[0].id}`,
                  });
                });
            }
          });
        })
        .catch((err) => {
          res.status(401).json({ Error: "Missing or invalid JWTs" }).end();
        });
    }
  } else {
    res.status(401).json({ Error: "Missing or invalid JWTs" }).end();
  }
};

/**
 * Deletes a client by finding the service in the datastore and a call
 * to delete_client.
 * @param {String} req.id ID of the client to delete.
 * If the client does not exist, it returns status 404.
 * If the client exists, it returns status 204.
 */
const delete_a_client = (req, res) => {
  let authorization = req.headers["authorization"];
  if (authorization !== undefined) {
    // Get the token value
    let items = authorization.split(/[ ]+/);
    if (items.length > 1 && items[0].trim() == "Bearer") {
      let token = items[1];
      // verify token
      oauth2Client
        .verifyIdToken({
          idToken: token,
          audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        })
        .then((ticket) => {
          const payload = ticket.getPayload();
          const userid = payload["sub"];

          if (req.params.id === undefined || req.params.id === null) {
            res
              .status(400)
              .json({
                Error: "client_id must not be null",
              })
              .end();
            return;
          }

          client_ds.get_client(req.params.id).then((client) => {
            if (client[0] === undefined || client[0] === null) {
              res
                .status(404)
                .json({ Error: "No client with this client_id exists" })
                .end();
              return;
            } else if (userid != client[0].owner) {
              res
                .status(403)
                .json({
                  Error:
                    "The user does not have access privileges to this client",
                })
                .end();
            } else {
              // Remove client's relation to its services
              for (let i = 0; i < client[0].services.length; i++) {
                serviceController
                  .get_service(client[0].services[i])
                  .then((service) => {
                    serviceController.update_service(
                      service[0].id,
                      service[0].name,
                      service[0].type,
                      service[0].price,
                      null
                    );
                  });
              }

              client_ds.delete_client(req.params.id).then(() => {
                res.status(204).end();
              });
            }
          });
        })
        .catch((err) => {
          res.status(401).json({ Error: "Missing or invalid JWTs" }).end();
        });
    }
  } else {
    res.status(401).json({ Error: "Missing or invalid JWTs" }).end();
  }
};

/**
 * Assigns a client a service and assigns that client to that service.
 * @param {Object} req To retrieve the client_id and service_id.
 * If the client is assigned to the service, it return status 204.
 * If the authorization is invalid or missing, it returns status 401.
 * If the client does not belong to the user or the service already has
 * a client, it return status 403.
 * If the service or client does not exist, it return status 404.
 */
const assign_service = (req, res) => {
  let authorization = req.headers["authorization"];
  if (authorization !== undefined) {
    // Get the token value
    let items = authorization.split(/[ ]+/);
    if (items.length > 1 && items[0].trim() == "Bearer") {
      let token = items[1];
      // verify token
      oauth2Client
        .verifyIdToken({
          idToken: token,
          audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        })
        .then((ticket) => {
          const payload = ticket.getPayload();
          const userid = payload["sub"];

          if (
            req.params.client_id === undefined ||
            req.params.client_id === null ||
            req.params.service_id === undefined ||
            req.params.service_id === null
          ) {
            res
              .status(400)
              .json({
                Error: "client_id or service_id must not be null",
              })
              .end();
            return;
          }

          client_ds.get_client(req.params.client_id).then((client) => {
            if (client[0] === undefined || client[0] === null) {
              res
                .status(404)
                .json({
                  Error:
                    "No client with this client_id exists, and/or no service with this service_id exists",
                })
                .end();
              return;
            } else if (userid != client[0].owner) {
              res
                .status(403)
                .json({
                  Error:
                    "The user does not have access privileges to this client",
                })
                .end();
            } else {
              service_ds.get_service(req.params.service_id).then((service) => {
                if (service[0] === undefined || service[0] === null) {
                  res
                    .status(404)
                    .json({
                      Error:
                        "No client with this client_id exists, and/or no service with this service_id exists",
                    })
                    .end();
                  return;
                }

                if (service[0].client != null) {
                  res
                    .status(403)
                    .json({
                      Error: "The service already has a client",
                    })
                    .end();
                  return;
                }

                const new_service = {
                  id: req.params.service_id,
                };
                // Add the service to the client
                client[0].services.push(new_service);

                // Update the client
                client_ds
                  .put_client(
                    req.params.client_id,
                    client[0].name,
                    client[0].contact_manager,
                    client[0].email,
                    client[0].services,
                    client[0].owner
                  )
                  .then(() => {
                    // Update the service id, name, type, price, client
                    service_ds.put_service(
                      req.params.service_id,
                      service[0].name,
                      service[0].type,
                      service[0].price,
                      req.params.client_id
                    );
                    res.status(204).end();
                  });
              });
            }
          });
        })
        .catch((err) => {
          res.status(401).json({ Error: "Missing or invalid JWTs" }).end();
        });
    }
  } else {
    res.status(401).json({ Error: "Missing or invalid JWTs" }).end();
  }
};

/**
 * Assigns a client a service and assigns that client to that service.
 * @param {Object} req To retrieve the client_id and service_id.
 * If the client is assigned to the service, it return status 204.
 * If the authorization is invalid or missing, it returns status 401.
 * If the client does not belong to the user or the service already has
 * a client, it return status 403.
 * If the service or client does not exist, it return status 404.
 */
const unlink_service = (req, res) => {
  let authorization = req.headers["authorization"];
  if (authorization !== undefined) {
    // Get the token value
    let items = authorization.split(/[ ]+/);
    if (items.length > 1 && items[0].trim() == "Bearer") {
      let token = items[1];
      // verify token
      oauth2Client
        .verifyIdToken({
          idToken: token,
          audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        })
        .then((ticket) => {
          const payload = ticket.getPayload();
          const userid = payload["sub"];

          if (
            req.params.client_id === undefined ||
            req.params.client_id === null ||
            req.params.service_id === undefined ||
            req.params.service_id === null
          ) {
            res
              .status(400)
              .json({
                Error: "client_id or service_id must not be null",
              })
              .end();
            return;
          }

          client_ds.get_client(req.params.client_id).then((client) => {
            if (client[0] === undefined || client[0] === null) {
              res
                .status(404)
                .json({
                  Error:
                    "No client with this client_id exists, and/or no service with this service_id exists",
                })
                .end();
              return;
            } else if (userid != client[0].owner) {
              res
                .status(403)
                .json({
                  Error:
                    "The user does not have access privileges to this client",
                })
                .end();
            } else {
              service_ds.get_service(req.params.service_id).then((service) => {
                if (service[0] === undefined || service[0] === null) {
                  res
                    .status(404)
                    .json({
                      Error:
                        "No client with this client_id exists, and/or no service with this service_id exists",
                    })
                    .end();
                  return;
                }
                // Check if the service has a client
                if (service[0].client != null) {
                  for (let i = 0; i < client[0].services.length; i++) {
                    client[0].services.splice(i, 1);
                  }
                }
                // Update the client
                client_ds
                  .put_client(
                    client[0].id,
                    client[0].name,
                    client[0].contact_manager,
                    client[0].email,
                    client[0].services,
                    client[0].owner
                  )
                  .then(() => {
                    // Update the service id, name, type, price, client
                    service_ds.put_service(
                      service[0].id,
                      service[0].name,
                      service[0].type,
                      service[0].price,
                      null
                    );
                    res.status(204).end();
                  });
              });
            }
          });
        })
        .catch((err) => {
          res.status(401).json({ Error: "Missing or invalid JWTs" }).end();
        });
    }
  } else {
    res.status(401).json({ Error: "Missing or invalid JWTs" }).end();
  }
};

module.exports = {
  create_client,
  get_clients_from_user,
  get_a_client_from_user,
  replace_a_client,
  update_a_client,
  delete_a_client,
  assign_service,
  unlink_service,
};
