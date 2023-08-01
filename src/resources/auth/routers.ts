import express = require("express");
import {
  registerEmployee,
  loginEmployee,
  someSecureResource,
  // updateEmployeePasswordById,
  // updateEmployeeInfoById,
} from "./controller";
import { verifyToken } from "../../core/middleware";

export const authRouter = express.Router();

authRouter.post("/register", registerEmployee);
authRouter.post("/login", loginEmployee);
authRouter.all("/sthSecure", verifyToken, someSecureResource);
