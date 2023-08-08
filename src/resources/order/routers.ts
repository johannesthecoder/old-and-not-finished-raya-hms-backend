import express = require("express");
import { addOrder, findOrderById, findOrders, addItemToAnOrderById } from "./controller";
import { verifyToken } from "../../core/middleware";

export const orderRouter = express.Router();

orderRouter.post("/", verifyToken, addOrder);
orderRouter.get("/:id([0-9a-f]{24})", verifyToken, findOrderById);
orderRouter.get("/", verifyToken, findOrders);
orderRouter.patch("/:id([0-9a-f]{24})", verifyToken, addItemToAnOrderById);
