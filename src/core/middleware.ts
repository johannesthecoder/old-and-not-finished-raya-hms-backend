import { ErrorType, HTTPStatusCodes } from "./constants";
import { ErrorResponseModel } from "./models";

const jwt = require("jsonwebtoken");

export const verifyToken = (req, res, next) => {
  const token =
    req.body.token || req.query.token || req.headers["x-access-token"];

  if (!token)
    throw {
      success: false,
      statusCode: HTTPStatusCodes.UNAUTHORIZED,
      errors: [
        {
          type: ErrorType.UNAUTHORIZED,
          message: `no credential/access token was found. please provide the token in one of the following [requestBody.token, queryParameter.token, header["x-access-token"]].`,
        },
      ],
    } as ErrorResponseModel;

  try {
    const decoded = jwt.verify(token, process.env.TOKEN_KEY);
    req.body["$user"] = decoded;
  } catch (error) {
    console.error(error);

    throw {
      success: false,
      statusCode: HTTPStatusCodes.BAD_REQUEST,
      errors: [
        {
          type: ErrorType.INVALID_DATA,
          message: `expired or invalid credential/access token was given. please provide the correct access token or login again and try.`,
        },
      ],
    } as ErrorResponseModel;
  }
  return next();
};
