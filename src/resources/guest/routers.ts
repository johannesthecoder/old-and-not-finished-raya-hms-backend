import express = require("express");
import {
  addGuest,
  findGuestById,
  findGuests,
  findGuestsBySearchString,
  updateGuestInfoById,
} from "./controller";
import { verifyToken } from "../../core/middleware";

export const guestRouter = express.Router();

guestRouter.post("/", verifyToken, addGuest);
guestRouter.get("/:id([0-9a-f]{24})", verifyToken, findGuestById);
guestRouter.get("/", verifyToken, findGuests);
guestRouter.get("/search", verifyToken, findGuestsBySearchString);
guestRouter.patch("/:id([0-9a-f]{24})", verifyToken, updateGuestInfoById);
