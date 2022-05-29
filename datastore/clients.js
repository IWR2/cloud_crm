const ds = require("./datastore");
const datastore = ds.datastore;

const CLIENT = "Client";

/**
 * Takes a client from the datstore and retrieves its attributes. It
 * returns the specified client from the datastore.
 * @param {String} CLIENT Kind in the datastore
 * @returns {Object} client Client object from the datastore.
 */
const client_from_datastore = (CLIENT) => {
  let client = {
    id: CLIENT[datastore.KEY].id,
    name: CLIENT.name,
    contact_manager: CLIENT.contact_manager,
    email: CLIENT.email,
    owner: CLIENT.owner,
    services: CLIENT.services,
  };
  return client;
};

/**
 * Adds a client to Datastore. It makes a new client object in the Datastore and
 * updates it to have an ID. After updating the object, it returns the new_client
 * object of the created cient.
 * @param {String} name The client's name
 * @param {String} contact_manager The client's contact manager.
 * @param {String} email The client's email.
 * @param {String} owner The owner of this client taken from the sub
 * * value of the user's JWT.
 * @param {String} services The array of services containing their
 * service ID. By default the array is empty.

 * @returns A call to datastore to save the client and returns new_client.
 */
const post_client = (name, contact_manager, email, owner, services = []) => {
  const key = datastore.key(CLIENT);
  const client = {
    name,
    contact_manager,
    email,
    owner,
    services,
  };
  const new_client = {
    key: key,
    data: client,
  };

  return datastore.save(new_client).then(() => {
    return new_client;
  });
};

/**
 * Returns total count of clients of a User.
 * @param {String} owner_id Sub value from a User's JWT.
 * @returns Number of Clients that belong to a User.
 */
const get_clients_count = (owner_id) => {
  let all_clients_query = datastore
    .createQuery(CLIENT)
    .filter("owner", "=", owner_id);
  return datastore.runQuery(all_clients_query).then((entities) => {
    return entities[0].length;
  });
};

/**
 * Returns the list of all clients belonging to a User from the
 * datastore with a limit of 5 clients per page and a link to the next
 * 5 clients. The last page does not have a next link.
 * @param {String} req
 * @returns JSON containing the list of all services.
 */
const get_clients = async (req, owner_id) => {
  let client_query = datastore
    .createQuery(CLIENT)
    .filter("owner", "=", owner_id)
    .limit(5);

  let count = await get_clients_count(owner_id);

  const results = {};
  if (Object.keys(req.query).includes("cursor")) {
    client_query = client_query.start(req.query.cursor);
  }
  // Get the next 5 clients
  return datastore.runQuery(client_query).then((entities) => {
    // Set the 5 clients to results
    results.clients = entities[0].map(client_from_datastore);

    // set the self link for each service
    for (let i = 0; i < results.clients.length; i++) {
      // Check if the client has a service
      let client = results.clients[i];
      if (client.services.length < 0) {
        // Get the service's data
        let current_services = [];
        let services = client.services;
        // Get the current service and set its attributes
        for (let j = 0; j < services.length; j++) {
          let service = services[j];
          let service_data = {
            id: service.id,
            self:
              req.protocol +
              "://" +
              req.get("host") +
              "/services/" +
              service.id,
          };
          current_services.push(service_data);
        }
        // Replace the services with current_services
        client.services = current_services;
      }
      client.self =
        req.protocol + "://" + req.get("host") + `${req.baseUrl}/` + client.id;
    }
    // Check datastores' moreResults if there are no more results.
    if (entities[1].moreResults !== datastore.NO_MORE_RESULTS) {
      // There are more results, build the next link
      results.next =
        req.protocol +
        "://" +
        req.get("host") +
        req.baseUrl +
        "?cursor=" +
        entities[1].endCursor;
    }
    // set items to be the total number of services
    results.items = count;
    return results;
  });
};

/**
 * Uses ID to find the client from the datastore and returns the client
 * object.
 * @param {number} id Int ID value
 * @returns An array of length 1.
 *      If a client with the provided id exists, then the element in the array
 *           is that client.
 *      If no client with the provided id exists, then the value of the
 *          element is undefined.
 */
const get_client = (id) => {
  const client_id = parseInt(id, 10);
  const key = datastore.key([CLIENT, client_id]);
  const client_query = datastore
    .createQuery(CLIENT)
    .filter("__key__", "=", key);
  return datastore.runQuery(client_query).then((entity) => {
    return entity[0].map(client_from_datastore);
  });
};

module.exports = {
  post_client,
  get_clients,
  get_client,
};
