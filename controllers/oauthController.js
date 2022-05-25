const axios = require("axios");
const { Datastore } = require("@google-cloud/datastore");
const { google } = require("googleapis");
const { OAuth2Client } = require("google-auth-library");

const {
  CLIENT_ID,
  CLIENT_SECRET,
  SCOPE,
  REDIRECT_URL,
} = require("../constants");

const oauth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);

/* Renders the home page */
const index = (req, res) => {
  res.render("home", { title: "Welcome" });
};

/* Creates the redirect URI and redirects to Google's OAuth 2.0 */
const authorize = (req, res) => {
  // Generate a url that asks permissions for the People API scope
  const authorizationUrl = oauth2Client.generateAuthUrl({
    // 'online' (default) or 'offline' (gets refresh_token)
    access_type: "online",
    /** Pass in the People scope array defined above. */
    scope: SCOPE,
    // Enable incremental authorization. Recommended as a best practice.
    include_granted_scopes: true,
  });

  res.redirect(301, authorizationUrl);
};

const oauth = (req, res) => {
  const data = {
    code: req.query.code,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    redirect_uri: REDIRECT_URL,
    grant_type: "authorization_code",
  };
  axios({
    method: "post",
    url: "https://oauth2.googleapis.com/token",
    data: data,
    responseType: "json",
  })
    .then((response) => {
      // The OAuth access token will be added to the Authorization header of the request.
      USER_CREDENTIAL = response.data.id_token;
      // Send the user details with the access token
      axios({
        method: "get",
        url: "https://www.googleapis.com/userinfo/v2/me",
        headers: {
          Authorization: `Bearer ${response.data.access_token}`,
        },
        responseType: "json",
      })
        .then((response) => {
          // Render the user details
          console.log("Sub: ", response.data.id);
          // TODO:
          // Check if the sub exists,
          // if sub does not exist in datstore, store it
          // else do not store it
          // finally render the details
          const user_details = {
            name: response.data.name,
            id_token: USER_CREDENTIAL,
            title: "User Details",
          };
          //verify().catch(console.error);
          res.status(301).render("user_details", user_details);
        })
        .catch((error) => {
          console.log("You messed up the get");
          res.status(401).render("401", { title: "401" });
        });
    })
    .catch((error) => {
      console.log("You messed up the post");
      res.status(400).render("400", { title: "400" });
    });
};

module.exports = {
  index,
  authorize,
  oauth,
};
