const user_ds = require("../datastore/users");

/* Gets all users from the datastore */
const get_all_users = (req, res) => {
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
  const users = user_ds.get_users().then((users) => {
    res.status(200).json({ results: users }).end();
  });
};

module.exports = {
  get_all_users,
};
