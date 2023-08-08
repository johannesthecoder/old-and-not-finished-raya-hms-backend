import mongoose from "mongoose";
import { RoomType } from "../../core/constants";

const RoomSchema = new mongoose.Schema(
  {
    number: { type: Number, required: true, unique: true },
    floor: { type: String, required: true },
    type: {
      type: String,
      enum: Object.values(RoomType),
      required: true,
    },
    isOccupied: { type: Boolean, default: false },
    isClean: { type: Boolean, default: false },
    isOutOfOrder: { type: Boolean, default: false },
    problems: { type: [String], default: [] },
  },
  {
    collection: "rooms",
  }
);

export const RoomModel = mongoose.model("Room", RoomSchema);
