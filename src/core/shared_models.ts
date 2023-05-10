import { ErrorType } from "./constants";

/**
 * @param success since it's error response must always be false
 * @param type general error type
 * @param title more specific error type
 * @param message detailed description of the error
 * @param statusCode HTTP status codes1
 * @param meta [not for end user]
 *
 * @example {
 *  success: false,
 *  type: "INCORRECT_DATA",
 *  title: "amount isn't valid number",
 *  message: "given amount is '-34'. But amount must be grater than 0",
 *  statusCode: 422,
 *  more: {location: ["requestBody", "amount"]}
 * }
 */
export interface ErrorResponseModel {
  success: false;
  type: ErrorType;
  title: string;
  message: string;
  statusCode: number;
  more?: any;
}
