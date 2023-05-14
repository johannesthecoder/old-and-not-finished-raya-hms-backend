import express = require("express");
import {
  EmployeeBaseModel,
  EmployeeReadModel,
  SingleEmployeeResponseModel,
} from "./models";
import { globalExceptionHandler } from "../../core/utilities";
import { employeeController } from "./controller";
import { ErrorResponseModel } from "../../core/shared_models";
import { HTTPStatusCodes } from "../../core/constants";
import { isDefined } from "../../core/checker";
import { verifyToken } from "../../core/middleware";
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

export const authRouter = express.Router();

authRouter.post(
  "/register",
  async function (req: express.Request, res: express.Response, next) {
    try {
      let newEmployee: EmployeeBaseModel = EmployeeBaseModel.fromJson(req.body);

      let oldEmployee = await employeeController.getOne({
        filter: `phoneNumber = "${req.body.phoneNumber}"`,
      });

      if (oldEmployee.id) {
        throw {
          success: false,
          type: "DUPLICATED_ENTRY",
          title: "employee with phone number already exist",
          message: `phoneNumber: ${req.body.phoneNumber}, employee already exist with this phone number. try using your own phone number.`,
          statusCode: HTTPStatusCodes.CONFLICT,
        } as ErrorResponseModel;
      } else {
        newEmployee.password = await bcrypt.hash(newEmployee.password, 10);

        let insertedEmployee = await employeeController.getOneById({
          id: await employeeController.insertOne({
            newEmployee: newEmployee,
          }),
        });

        const token: string = jwt.sign(
          {
            userId: insertedEmployee.id,
            phoneNumber: insertedEmployee.phoneNumber,
          },
          process.env.TOKEN_KEY,
          { expiresIn: "5h" }
        );

        res.status(201).json({
          success: true,
          employee: { ...insertedEmployee } as EmployeeReadModel,
          more: {
            accessToken: token,
          },
        } as SingleEmployeeResponseModel);
      }
    } catch (error: any) {
      if (error.code === "ER_DUP_ENTRY") {
        error.type = "DUPLICATED_ENTRY";
        error.title = "duplicated room number";
        error.statusCode = HTTPStatusCodes.CONFLICT;
      }

      globalExceptionHandler(error, next);
    }
  }
);

authRouter.post(
  "/login",
  async function (req: express.Request, res: express.Response, next) {
    try {
      const { phoneNumber, password } = req.body;
      isDefined(phoneNumber, "phoneNumber");
      isDefined(password, "password");

      let employee = await employeeController.getOne({
        filter: `phoneNumber = "${req.body.phoneNumber}"`,
      });

      if (!employee || !(await bcrypt.compare(password, employee.password))) {
        throw {
          success: false,
          type: "INCORRECT_DATA",
          title: "invalid credentials",
          message: `invalid phoneNumber or password.`,
          statusCode: HTTPStatusCodes.BAD_REQUEST,
          more: {
            more: {
              password: password,
              employeePassword: employee.password,
              bcryptCompare: await bcrypt.compare(password, employee.password),
              employee: employee,
            },
          },
        } as ErrorResponseModel;
      }

      const token: string = jwt.sign(
        {
          userId: employee.id,
          phoneNumber: employee.phoneNumber,
        },
        process.env.TOKEN_KEY,
        { expiresIn: "5h" }
      );

      res.json({
        success: true,
        employee: { ...employee } as EmployeeReadModel,
        more: {
          accessToken: token,
        },
      } as SingleEmployeeResponseModel);
    } catch (error: any) {
      globalExceptionHandler(error, next);
    }
  }
);

authRouter.get(
  "/somethingSecure",
  verifyToken,
  async function (req: express.Request, res: express.Response, next) {
    res.status(200).json({
      success: true,
      awesome: "Yep it works man. It WORRRRRRRRRRRKS",
    });
  }
);
