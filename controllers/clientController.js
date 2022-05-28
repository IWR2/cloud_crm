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

module.exports = {
  create_client,
};