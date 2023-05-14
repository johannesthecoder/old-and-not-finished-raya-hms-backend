import { ErrorResponseModel } from "./shared_models";
import { HTTPStatusCodes } from "./constants";
import moment = require("moment");

export function isDefined(
  variable: any,
  name: string,
  raiseExceptionIfFalse: boolean = true
): boolean {
  if (
    variable == null ||
    (typeof variable == "string" && variable.length == 0)
  ) {
    if (raiseExceptionIfFalse) {
      throw {
        success: false,
        type: "MISSING_DATA",
        title: `${name} is missing`,
        message: `${name} is required. provide ${name} and try again.`,
        statusCode: HTTPStatusCodes.UNPROCESSABLE_ENTITY,
      } as ErrorResponseModel;
    } else {
      return false;
    }
  } else {
    return true;
  }
}

export function isNotDefined(
  variable: any,
  name: string,
  raiseExceptionIfFalse: boolean = true
): boolean {
  return !isDefined(variable, name);
}

export function isNumber(
  variable: any,
  name: string,
  raiseExceptionIfFalse: boolean = true
): boolean {
  if (
    isDefined(variable, name) &&
    !Array.isArray(variable) &&
    !isNaN(Number(variable))
  )
    return true;

  if (raiseExceptionIfFalse)
    throw {
      success: false,
      type: "INCORRECT_DATA",
      title: `${name}: ${variable} is not a number`,
      message: `the value of ${name}=${variable} is not a valid number. provide a valid number for ${name} and try again.`,
      statusCode: HTTPStatusCodes.UNPROCESSABLE_ENTITY,
    } as ErrorResponseModel;
  else return false;
}

export function isPositiveNumber(
  variable: any,
  name: string,
  raiseExceptionIfFalse: boolean = true
): boolean {
  if (
    isDefined(variable, name) &&
    !Array.isArray(variable) &&
    !isNaN(Number(variable)) &&
    Number(variable) > 0
  )
    return true;

  if (raiseExceptionIfFalse)
    throw {
      success: false,
      type: "INCORRECT_DATA",
      title: `${name}: ${variable} is not a positive number`,
      message: `the value of ${name}=${variable} is not a positive number. ${name} must be > 0`,
      statusCode: HTTPStatusCodes.UNPROCESSABLE_ENTITY,
    } as ErrorResponseModel;
  else return false;
}

// export function isBoolean(
//   variable: any,
//   name: string,
//   raiseExceptionIfFalse: boolean = true
// ): boolean {
//   if (isDefined(variable, name) && typeof (variable) === "boolean") return true;

//   if (raiseExceptionIfFalse)
//     throw {
//       success: false,
//       type: "INCORRECT_DATA",
//       title: `${name}: ${variable} is not a boolean`,
//       message: `the value of ${name}=${variable} is not a valid boolean. the only accepted values for ${name} are true | false.`,
//       statusCode: HTTPStatusCodes.UNPROCESSABLE_ENTITY,
//     } as ErrorResponseModel;
//   else return false;
// }

export function isParsableToArray(
  variable: any,
  name: string,
  raiseExceptionIfFalse: boolean = true
): boolean {
  try {
    if (Array.isArray(JSON.parse(variable))) return true;
  } catch (error) {}

  if (raiseExceptionIfFalse)
    throw {
      success: false,
      type: "INCORRECT_DATA",
      title: `${name}: ${variable} is not parsable to an array`,
      message: `the value of ${name}=${variable} is not a parsable to array. provide a string that is parable to array.`,
      statusCode: HTTPStatusCodes.UNPROCESSABLE_ENTITY,
    } as ErrorResponseModel;
  else return false;
}

export function isArray(
  variable: any,
  name: string,
  raiseExceptionIfFalse: boolean = true
): boolean {
  try {
    if (Array.isArray(variable)) return true;
  } catch (error) {}

  if (raiseExceptionIfFalse)
    throw {
      success: false,
      type: "INCORRECT_DATA",
      title: `${name}: ${variable} is not an array`,
      message: `the value of ${name}=${variable} is not an array. provide a valid array for the variable ${name}`,
      statusCode: HTTPStatusCodes.UNPROCESSABLE_ENTITY,
    } as ErrorResponseModel;
  else return false;
}

export function isParsableToObject(
  variable: any,
  name: string,
  raiseExceptionIfFalse: boolean = true
): boolean {
  try {
    if (typeof JSON.parse(variable) === "object") return true;
  } catch (error) {}

  if (raiseExceptionIfFalse)
    throw {
      success: false,
      type: "INCORRECT_DATA",
      title: `${name}: ${variable} is not parsable to an object`,
      message: `the value of ${name}=${variable} is not a parsable to object. provide a string that is parable to object.`,
      statusCode: HTTPStatusCodes.UNPROCESSABLE_ENTITY,
    } as ErrorResponseModel;
  else return false;
}

export function isObject(
  variable: any,
  name: string,
  raiseExceptionIfFalse: boolean = true
): boolean {
  try {
    if (typeof variable === "object") return true;
  } catch (error) {}

  if (raiseExceptionIfFalse)
    throw {
      success: false,
      type: "INCORRECT_DATA",
      title: `${name}: ${variable} is not an object`,
      message: `the value of ${name}=${variable} is not an object. provide a valid object for the variable ${name}`,
      statusCode: HTTPStatusCodes.UNPROCESSABLE_ENTITY,
    } as ErrorResponseModel;
  else return false;
}

export function isDate(
  variable: any,
  name: string,
  raiseExceptionIfFalse: boolean = true
): boolean {
  if (moment(variable).isValid()) return true;
  else if (raiseExceptionIfFalse)
    throw {
      success: false,
      type: "INCORRECT_DATA",
      title: `${name}: ${variable} is not date`,
      message: `the value of ${name}=${variable} is not an date. ${name} must be a valid date e.g YYYY-mm-DDTHH:MM:SS`,
      statusCode: HTTPStatusCodes.UNPROCESSABLE_ENTITY,
    } as ErrorResponseModel;
  else return false;
}

export function isValidPaymentMode(
  variable: any,
  name: string,
  raiseExceptionIfFalse: boolean = true
): boolean {
  return isValidValue(
    variable,
    ["M-PESA", "CASH", "VISA", "CHEQUE"],
    name,
    raiseExceptionIfFalse
  );
}

export function isValidEmployeePosition(
  variable: any,
  name: string,
  raiseExceptionIfFalse: boolean = true
): boolean {
  return isValidValue(
    variable,
    ["ADMIN", "MANAGER", "RECEPTION"],
    name,
    raiseExceptionIfFalse
  );
}

export function isValidRoomType(
  variable: any,
  name: string,
  raiseExceptionIfFalse: boolean = true
): boolean {
  return isValidValue(
    variable,
    ["SINGLE", "DOUBLE", "DELUXE", "TWIN", "TRIPLET"],
    name,
    raiseExceptionIfFalse
  );
}

export function isValidValue(
  value: any,
  validValues: string[],
  name: string,
  raiseExceptionIfFalse: boolean = true
): boolean {
  if (validValues.includes(value)) return true;
  if (raiseExceptionIfFalse)
    throw {
      success: false,
      type: "INCORRECT_DATA",
      title: `${name}: ${value} is valid value`,
      message: `the value of ${name}=${value} is not valid value. ${name} must be one of the following ${validValues}`,
      statusCode: HTTPStatusCodes.UNPROCESSABLE_ENTITY,
    } as ErrorResponseModel;
  else return false;
}
