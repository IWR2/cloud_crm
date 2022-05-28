const express = require("express");
const oauth = require("./routes/oauthRoutes");
const users = require("./routes/usersRoutes");
const services = require("./routes/servicesRoutes");
const clients = require("./routes/clientsRoutes");

const bodyParser = require("body-parser");

const app = express();

app.enable("trust proxy");
app.set("view engine", "ejs");
app.use(express.static("public"));

app.use(bodyParser.json());

app.use("/", oauth);
app.use("/users", users);
app.use("/services", services);
app.use("/clients", clients);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(
    `Server running on http://localhost:${PORT}. Press CTRL+C to end the server.`
  );
});
