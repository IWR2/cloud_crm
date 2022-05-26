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
const post_service = (name, type, price) => {
  const key = datastore.key(SERVICE);
  const service = {
    name,
    type,
    price,
  };
  const new_service = {
    key: key,
    data: service,
  };

  return datastore.save(new_service).then(() => {
    return new_service;
  });
};

module.exports = {
  post_service,
};
