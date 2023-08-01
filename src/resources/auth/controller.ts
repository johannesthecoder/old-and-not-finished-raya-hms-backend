import { Request, Response, NextFunction } from "express";
import { globalExceptionHandler } from "../../core/exceptions";
import { ErrorType, HTTPStatusCodes } from "../../core/constants";
import { EmployeeModel } from "./models";
import { ErrorResponseModel } from "../../core/models";

const jwt = require("jsonwebtoken");

export const registerEmployee = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let newEmployee = new EmployeeModel(req.body);

    let result = await newEmployee.save();

    if (result) {
      const token: string = jwt.sign(
        {
          userId: result.id,
          name: result.name,
          phoneNumber: result.phoneNumber,
          role: result.role,
        },
        process.env.TOKEN_KEY,
        { expiresIn: "5h" }
      );

      result.password = "*****";

      res.status(HTTPStatusCodes.CREATED).json({
        success: true,
        data: {
          employee: result,
          insertedId: result.id,
          accessToken: token,
        },
      });
    } else {
    }
  } catch (error: any) {
    globalExceptionHandler(error, next);
  }
};

export const loginEmployee = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { phoneNumber, password } = req.body;

    let result = await EmployeeModel.findOne({ phoneNumber: phoneNumber });

    if (!result) {
      throw {
        statusCode: HTTPStatusCodes.BAD_REQUEST,
        errors: [
          {
            type: ErrorType.INVALID_DATA,
            message:
              "incorrect phone number or password. please provide the correct phone number and password",
          },
        ],
      } as ErrorResponseModel;
    } else if (!(await result.comparePassword(password))) {
      throw {
        statusCode: HTTPStatusCodes.BAD_REQUEST,
        errors: [
          {
            type: ErrorType.INVALID_DATA,
            message:
              "incorrect phone number or password. please provide the correct phone number and password",
          },
        ],
      } as ErrorResponseModel;
    }

    const token: string = jwt.sign(
      {
        userId: result.id,
        name: result.name,
        phoneNumber: result.phoneNumber,
        role: result.role,
      },
      process.env.TOKEN_KEY,
      { expiresIn: "2000h" }
    );

    result.password = "*****";

    res.status(HTTPStatusCodes.OK).json({
      success: true,
      data: {
        employee: result,
        insertedId: result.id,
        accessToken: token,
      },
    });
  } catch (error: any) {
    globalExceptionHandler(error, next);
  }
};

export const someSecureResource = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    delete req.query.asdf;
    res.status(200).json({
      success: true,
      awesome: "Yep it works man. It WORKS",
      user: req.body["$user"],
    });
  } catch (error) {
    globalExceptionHandler(error, next);
  }
};

// TODO function updateEmployeePasswordById()
