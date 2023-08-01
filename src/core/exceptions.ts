import { ErrorType, HTTPStatusCodes } from "./constants";
import { ErrorModel, ErrorResponseModel } from "./models";

export function globalExceptionHandler(error, next) {
  next({
    success: false,
    statusCode: error.statusCode
      ? error.statusCode
      : error.code === 11000
      ? HTTPStatusCodes.CONFLICT
      : error.errors && !Array.isArray(error.errors)
      ? HTTPStatusCodes.BAD_REQUEST
      : HTTPStatusCodes.INTERNAL_SERVER_ERROR,
    errors: error.errors
      ? Array.isArray(error.errors)
        ? error.errors
        : Object.keys(error.errors).map(
            (key) =>
              ({
                type:
                  error.errors[key].kind === "required"
                    ? ErrorType.MISSING_DATA
                    : ErrorType.INVALID_DATA,
                message: error.errors[key].message,
                detail: error.errors[key].properties,
              } as ErrorModel)
          )
      : error.code === 11000
      ? [
          {
            type: ErrorType.DUPLICATED_ENTRY,
            message:
              "error because duplicated entry. " +
              JSON.stringify(error.keyValue) +
              " already exists.",
          } as ErrorModel,
        ]
      : [
          {
            type: error.type || "UNKNOWN",
            message: error.message || "unknown error",
          } as ErrorModel,
        ],
  } as ErrorResponseModel);
}
