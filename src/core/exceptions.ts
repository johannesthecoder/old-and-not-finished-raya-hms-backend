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

export function notFoundExceptionHandler(name: string, filter: string) {
  throw {
    statusCode: HTTPStatusCodes.NOT_FOUND,
    errors: [
      {
        type: ErrorType.NOT_FOUND,
        message: `The requested ${name} matching ${filter} was not found in the database. Please verify your filter or try another request.`,
      },
    ],
  } as ErrorResponseModel;
}

export function missingDataExceptionHandler(name: string) {
  throw {
    statusCode: HTTPStatusCodes.BAD_REQUEST,
    errors: [
      {
        type: ErrorType.MISSING_DATA,
        message: `The request cannot be processed because the ${name} field is missing. Please provide the ${name} and try again.`,
      },
    ],
  } as ErrorResponseModel;
}

export function invalidDataExceptionHandler(name: string, expectedDataType: string) {
  throw {
    statusCode: HTTPStatusCodes.BAD_REQUEST,
    errors: [
      {
        type: ErrorType.MISSING_DATA,
        message: `The request cannot be processed due to invalid data. The ${name} field should be ${expectedDataType}. Please ensure the provided data adheres to the required format and validation rules.`,
      },
    ],
  } as ErrorResponseModel;
}

export function unauthorizedExceptionHandler() {
  throw {
    success: false,
    statusCode: HTTPStatusCodes.UNAUTHORIZED,
    errors: [
      {
        type: ErrorType.UNAUTHORIZED,
        message: "You are authenticated but do not have permission to access this resource.",
      },
    ],
  } as ErrorResponseModel;
}

export function unauthenticatedExceptionHandler() {
  throw {
    success: false,
    statusCode: HTTPStatusCodes.FORBIDDEN,
    errors: [
      {
        type: ErrorType.UNAUTHENTICATED,
        message:
          "You are not authorized to access this resource. Please provide valid authentication credentials.",
      },
    ],
  } as ErrorResponseModel;
}

export function unknownExceptionHandler() {
  throw {
    statusCode: HTTPStatusCodes.INTERNAL_SERVER_ERROR,
    errors: [
      {
        type: ErrorType.UNKNOWN,
        message: `An unknown error occurred while processing your request. Please try again now/later or contact the support team for assistance.`,
      },
    ],
  } as ErrorResponseModel;
}
