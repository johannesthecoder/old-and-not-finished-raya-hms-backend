import express = require("express");
import {
  addRoom,
  findRoomById,
  findRooms,
  roomIssueTrackerById,
  updateRoomInfoById,
  updateRoomStatus,
} from "./controller";
import { verifyToken } from "../../core/middleware";

export const roomRouter = express.Router();

roomRouter.post("/", verifyToken, addRoom);
roomRouter.get("/:id([0-9a-f]{24})", verifyToken, findRoomById);
roomRouter.get("/", verifyToken, findRooms);
roomRouter.patch("/:id([0-9a-f]{24})/info", verifyToken, updateRoomInfoById);
roomRouter.patch("/status", verifyToken, updateRoomStatus);
roomRouter.patch("/:id([0-9a-f]{24})/status", verifyToken, updateRoomStatus);
roomRouter.patch("/:id([0-9a-f]{24})/issue", verifyToken, roomIssueTrackerById);
