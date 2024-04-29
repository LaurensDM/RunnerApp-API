import { auth } from "express-oauth2-jwt-bearer";
import { requiredScopes } from "express-oauth2-jwt-bearer";
import dotenv from "dotenv";
dotenv.config();

const {AUTH0_ISSUER_BASE_URL, AUTH0_AUDIENCE, AUTH0_SECRET} = process.env;

const checkJwt = auth({
    audience: AUTH0_AUDIENCE,
    issuerBaseURL: AUTH0_ISSUER_BASE_URL,
    jwksUri: `${AUTH0_ISSUER_BASE_URL}.well-known/jwks.json`,
    issuer: `${AUTH0_ISSUER_BASE_URL}`,
  });
  
const checkScopes = requiredScopes('read:messages');
  
export default { checkJwt, checkScopes };