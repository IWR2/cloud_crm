const user_ds = require("../datastore/users");

const get_all_users = (req, res) => {
  const users = user_ds.get_users().then((users) => {
    res.status(200).json({ results: users }).end();
  });
};

module.exports = {
  get_all_users,
};
