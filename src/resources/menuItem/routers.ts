import express = require("express");
import {
  addMenuItem,
  findMenuItemById,
  findMenuItems,
  updateMenuItemById,
} from "./controller";
import { verifyToken } from "../../core/middleware";

export const menuItemRouter = express.Router();

menuItemRouter.post("/", verifyToken, addMenuItem);
menuItemRouter.get("/:id([0-9a-f]{24})", verifyToken, findMenuItemById);
menuItemRouter.get("/", verifyToken, findMenuItems);
menuItemRouter.patch("/:id([0-9a-f]{24})", verifyToken, updateMenuItemById);
