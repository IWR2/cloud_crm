const ds = require("./datastore");
const datastore = ds.datastore;

const CLIENT = "Client";

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

module.exports = {
  post_client,
};
