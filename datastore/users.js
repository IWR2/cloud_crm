const ds = require("./datastore");
const datastore = ds.datastore;

const USER = "User";

/**
 * Takes a user from the datstore and retrieves its attributes. It returns
 * the specified boat from the datastore.
 * @param {String} USER Kind in the datastore
 * @returns {Object} user User object from the datastore.
 */
const user_from_datastore = (USER) => {
  let user = {
    id: USER[datastore.KEY].id,
    subject: USER.subject,
  };
  return user;
};

/**
 * Adds a user to Datastore. It makes a new user object in the Datastore and
 * updates it to have an ID. After updating the object, it returns the new_user
 * object of the created user.
 * @param {String} subject Sub value from the JWT.
 * @returns A call to datastore to save the user and returns new_user.
 */
const post_user = (subject) => {
  const key = datastore.key(USER);
  const user = {
    subject: subject,
  };
  const new_user = {
    key: key,
    data: user,
  };

  return datastore.save(new_user).then(() => {
    return new_user;
  });
};

/**
 * Checks if the user is already in the datastore.
 * @param {String} subject Sub value from the JWT.
 * @returns An array of length 1.
 *      If a user with the provided sub exists, then the element in the array
 *           is that user.
 *      If no user with the provided sub exists, then the value of the
 *          element is undefined.
 */
const check_if_user_exists = (subject) => {
  const user_query = datastore
    .createQuery(USER)
    .filter("subject", "=", subject);
  return datastore.runQuery(user_query).then((entity) => {
    return entity[0].map(user_from_datastore);
  });
};

const get_users = () => {
  const user_query = datastore.createQuery(USER);
  return datastore.runQuery(user_query).then((users) => {
    return users[0].map(user_from_datastore);
  });
};

module.exports = {
  post_user,
  check_if_user_exists,
  get_users,
};
