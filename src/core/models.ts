import { ErrorType, HTTPStatusCodes } from "./constants";

export interface ErrorModel {
  type: ErrorType;
  message: string;
  detail?: any;
}

export interface ErrorResponseModel {
  success: false;
  statusCode: HTTPStatusCodes;
  errors: [ErrorModel];
}

export interface SuccessResponseModel {
  success: true;
  statusCode: HTTPStatusCodes;
  meta: any;
}
