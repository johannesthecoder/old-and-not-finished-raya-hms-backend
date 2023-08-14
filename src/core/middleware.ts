import { ErrorType, HTTPStatusCodes } from "./constants";
import { unauthorizedExceptionHandler } from "./exceptions";
import { ErrorResponseModel } from "./models";

const jwt = require("jsonwebtoken");

export const verifyToken = (req, res, next) => {
  const token = req.body.token || req.query.token || req.headers["x-access-token"];

  if (!token) unauthorizedExceptionHandler();

  try {
    const decoded = jwt.verify(token, process.env.TOKEN_KEY);
    req.body["$user"] = decoded;
  } catch (error) {
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
