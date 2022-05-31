const ds = require("./datastore");
const datastore = ds.datastore;

const SERVICE = "Service";

/**
 * Takes a service from the datstore and retrieves its attributes. It returns
 * the specified service from the datastore.
 * @param {String} SERVICE Kind in the datastore
 * @returns {Object} service Service object from the datastore.
 */
const service_from_datastore = (USER) => {
  let service = {
    id: USER[datastore.KEY].id,
    name: USER.name,
    type: USER.type,
    client: USER.client,
    price: USER.price,
  };
  return service;
};

/**
 * Adds a service to Datastore. It makes a new service object in the Datastore and
 * updates it to have an ID. After updating the object, it returns the new_service
 * object of the created service.
 * @param {String} name Name of the service.
 * @param {String} type Type of the service.
 * @param {Number} price Price of the service.
 * @returns A call to datastore to save the service and returns new_service.
 */
const post_service = (name, type, price, client = null) => {
  const key = datastore.key(SERVICE);
  const service = {
    name,
    type,
    price,
    client,
  };
  const new_service = {
    key: key,
    data: service,
  };

  return datastore.save(new_service).then(() => {
    return new_service;
  });
};

/* Returns total count of services. */
const get_services_count = () => {
  let all_services_query = datastore.createQuery(SERVICE);
  return datastore.runQuery(all_services_query).then((entities) => {
    return entities[0].length;
  });
};

/**
 * Returns the list of all services from the datastore with a limit of
 * 5 services per page and a link to the next 5 services. The last page
 * does not have a next link.
 * @param {String} req Query string parameter.
 * @returns JSON containing the list of all services.
 */
const get_services = async (req) => {
  let service_query = datastore.createQuery(SERVICE).limit(5);
  // Get the total number of services
  let count = await get_services_count();
  // Store the results set.
  const results = {};
  // If this query includes a "cursor" in the query string
  if (Object.keys(req.query).includes("cursor")) {
    // Set the query's start to that "cursor" location
    // will continue to start at the next 5 services
    service_query = service_query.start(req.query.cursor);
  }
  // Get the next 5 services
  return datastore.runQuery(service_query).then((entities) => {
    // Set the 5 services to results
    results.services = entities[0].map(service_from_datastore);

    // set the self link for each service
    for (let i = 0; i < results.services.length; i++) {
      let service = results.services[i];
      service.self =
        req.protocol + "://" + req.get("host") + `${req.baseUrl}/` + service.id;
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
 * Finds the ID of the service from the datastore and returns the service object.
 * @param {Number} id ID of the service.
 * @returns An array of length 1.
 *      If a service with the provided id exists, then the element in the array
 *           is that service.
 *      If no service with the provided id exists, then the value of the
 *          element is undefined.
 */
const get_service = (id) => {
  const service_id = parseInt(id, 10);
  const key = datastore.key([SERVICE, service_id]);
  const service_query = datastore
    .createQuery(SERVICE)
    .filter("__key__", "=", key);
  return datastore.runQuery(service_query).then((entity) => {
    return entity[0].map(service_from_datastore);
  });
};

/**
 * Updates all attributes of a service and returns a callback from
 * get_boat with the updated service object from the datastore.
 * @param {Number} id ID of the service to update.
 * @param {String} name Name of the service.
 * @param {String} type Type of the service.
 * @param {Number} price Price of the service.
 * @returns {Object} A call to datastore that returns the service object.
 */
const put_service = (id, name, type, price, client) => {
  const service_id = parseInt(id, 10);
  const key = datastore.key([SERVICE, service_id]);
  const service = {
    name,
    type,
    price,
    client,
  };
  return datastore.save({ key: key, data: service }).then(() => {
    return get_service(id);
  });
};

/**
 * Deletes a service from the datastore.
 * @param {Number} id ID of the service to delete.
 * @returns A call to datastore to delete the service.
 */
const delete_service = (id) => {
  const service_id = parseInt(id, 10);
  const key = datastore.key([SERVICE, service_id]);
  return datastore.delete(key);
};

module.exports = {
  post_service,
  get_services,
  get_service,
  put_service,
  delete_service,
};
