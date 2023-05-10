import { HTTPStatusCodes } from "./constants";
import { ErrorResponseModel } from "./shared_models";

const jwt = require("jsonwebtoken");

export const verifyToken = (req, res, next) => {
  const token =
    req.body.token || req.query.token || req.headers["x-access-token"];

  if (!token)
    throw {
      success: false,
      type: "CREDENTIAL_MISSING",
      title: "no access token",
      message: `no credential/access token was found. please provide the token in one of the following [requestBody.token, queryParameter.token, header["x-access-token"]].`,
      statusCode: HTTPStatusCodes.BAD_REQUEST,
    } as ErrorResponseModel;
  try {
    const decoded = jwt.verify(token, process.env.TOKEN_KEY);
    req.user = decoded;
  } catch (err) {
    throw {
      success: false,
      type: "INCORRECT_CREDENTIAL",
      title: "invalid access token",
      message: `invalid credential/access token was given. please provide the correct access token or login again and try.`,
      statusCode: HTTPStatusCodes.BAD_REQUEST,
    } as ErrorResponseModel;
  }
  return next();
};
