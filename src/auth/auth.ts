import { auth } from "express-oauth2-jwt-bearer";
import { requiredScopes } from "express-oauth2-jwt-bearer";
import dotenv from "dotenv";
dotenv.config();

const {AUTH0_ISSUER_BASE_URL, AUTH0_AUDIENCE, AUTH0_SECRET} = process.env;

const checkJwt = auth({
    audience: AUTH0_AUDIENCE,
    issuerBaseURL: AUTH0_ISSUER_BASE_URL,

  });
  
const checkScopes = requiredScopes('read:messages');
  
export default { checkJwt, checkScopes };