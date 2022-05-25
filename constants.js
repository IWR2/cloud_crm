// Google OAuth 2.0
//const BASE_URL = "https://cloud-crm-351300.wl.r.appspot.com";
const BASE_URL = "http://localhost:8080"; // Local URL

const CLIENT_ID =
  "507032020500-a1enhq5f16jsoupmobs3falph9r0t6hj.apps.googleusercontent.com";
const CLIENT_SECRET = "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";
const SCOPE = "https://www.googleapis.com/auth/userinfo.profile";

const REDIRECT_URL = BASE_URL + "/oauth";

module.exports = {
  BASE_URL: BASE_URL,
  CLIENT_ID: CLIENT_ID,
  CLIENT_SECRET: CLIENT_SECRET,
  SCOPE: SCOPE,
  REDIRECT_URL: REDIRECT_URL,
};
