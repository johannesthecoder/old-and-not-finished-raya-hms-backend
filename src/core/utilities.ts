import moment = require("moment");
import { ErrorResponseModel } from "./shared_models";
import { HTTPStatusCodes } from "./constants";

export function globalExceptionHandler(error, next) {
  next({
    success: false,
    type: error.type || "UNKNOWN",
    title: error.title || "unknown error",
    message: error.message || "unknown error",
    statusCode: error.statusCode || HTTPStatusCodes.INTERNAL_SERVER_ERROR,
    more:
      typeof error.more === "object" && Object.keys(error.more).length > 0
        ? error.more
        : { rawError: error },
  } as ErrorResponseModel);
}

/**
 *
 * @example "abcd" return "*a*b*c*d*"
 */
export function stringToMysqlRegex(s: string): string {
  let r: string = "%";
  s.split("").forEach(function (v) {
    r += `%${v}`;
  });

  return r;
}

/**
 * @example
 * ~ in the following example
 *    ~ HH:MM:SS are not required
 *    ~ default is 00:00:00
 * - "YYYY-mm-DD:HH:mm:SS" means on that day only
 * - "= YYYY-mm-DD:HH:mm:SS" means on that day only
 * - "> YYYY-mm-DD:HH:mm:SS" means exclusive after this day
 * - ">= YYYY-mm-DD:HH:mm:SS" means inclusive after this day
 * - "< YYYY-mm-DD:HH:mm:SS" means exclusive before this day
 * - "<= YYYY-mm-DD:HH:mm:SS" means inclusive before this day
 * - "< YYYY-mm-DD:HH:mm:SS" means before this day
 * - "<> YYYY-mm-DD:HH:mm:SS YYYY-mm-DD:HH:mm:SS" between those days
 * - ">< YYYY-mm-DD:HH:mm:SS YYYY-mm-DD:HH:mm:SS" between those days
 * @returns {string} if given a valid string
 * @returns {Error} if given invalid string
 */
export function queryDateFilterMysqlString(dateQuery: string): string {
  let mysqlString: string = "";
  let splittedDateFilter: string[] = String(dateQuery).split(" ");

  switch (splittedDateFilter.length) {
    case 1:
      if (moment(splittedDateFilter[0]).isValid())
        mysqlString = `= "${moment(splittedDateFilter[0]).toISOString()}"`;
      else throw new Error("invalid");
      break;
    case 2:
      if (
        moment(splittedDateFilter[1]).isValid() &&
        ["<", "<=", ">", ">=", "="].includes(splittedDateFilter[0])
      )
        mysqlString = `${splittedDateFilter[0]} "${moment(
          splittedDateFilter[1]
        ).toISOString()}"`;
      else throw new Error("invalid");
      break;
    case 3:
      if (
        moment(splittedDateFilter[2]).isValid() &&
        moment(splittedDateFilter[1]).isValid() &&
        ["><", "<>"].includes(splittedDateFilter[0])
      )
        mysqlString = `BETWEEN "${moment(
          splittedDateFilter[1]
        ).toISOString()}" AND "${moment(splittedDateFilter[2]).toISOString()}`;
      else throw new Error("invalid");
      break;

    default:
      throw new Error("invalid");
      break;
  }

  return mysqlString;
}

/**
 * @example
 * - "> XXX" means greater than XXX
 * - ">= XXX" means greater or equal to XXX
 * * - "> XXX" means less than XXX
 * - ">= XXX" means less or equal to XXX
 * - "= XXX" means equal to XXX
 * - "XXX" means equal to XXX
 * - "!= XXX" means not equal to XXX
 * - "=<>= XXX YYYY" means >= XXX & <= YYY
 * - "* XXX YYYY" means >= XXX & <= YYY
 * @returns {string} if given a valid string
 * @returns {Error} if given invalid string
 */
export function queryNumberFilterMysqlString(numberQuery: string): string {
  let mysqlString: string = "";
  let splittedNumberFilter: string[] = String(numberQuery).split(" ");

  switch (splittedNumberFilter.length) {
    case 1:
      if (!isNaN(Number(splittedNumberFilter[0])))
        mysqlString = `= ${splittedNumberFilter[0]}`;
      break;
    case 2:
      if (!isNaN(Number(splittedNumberFilter[1])))
        mysqlString = `${splittedNumberFilter[0]} ${splittedNumberFilter[1]}`;
      break;
    case 3:
      if (
        !isNaN(Number(splittedNumberFilter[1])) &&
        !isNaN(Number(splittedNumberFilter[2]))
      )
        mysqlString = `BETWEEN ${splittedNumberFilter[1]} AND ${splittedNumberFilter[2]}`;
      break;
    default:
      throw new Error("invalid");
      break;
  }
  return mysqlString;
}
