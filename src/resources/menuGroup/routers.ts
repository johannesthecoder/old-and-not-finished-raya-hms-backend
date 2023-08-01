import express = require("express");
import {
  addMenuGroup,
  findMenuGroupById,
  findMenuGroups,
  updateMenuGroupById,
} from "./controller";
import { verifyToken } from "../../core/middleware";

export const menuGroupRouter = express.Router();

menuGroupRouter.post("/", verifyToken, addMenuGroup);
menuGroupRouter.get("/:id([0-9a-f]{24})", verifyToken, findMenuGroupById);
menuGroupRouter.get("/", verifyToken, findMenuGroups);
menuGroupRouter.patch("/:id([0-9a-f]{24})", verifyToken, updateMenuGroupById);
