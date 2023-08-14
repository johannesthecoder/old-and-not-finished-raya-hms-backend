import { Document, Schema, model } from "mongoose";
import { RoomType } from "../../core/constants";
interface IRoom extends Document {
  number: number;
  floor: string;
  type: RoomType;
  isOccupied: boolean;
  isClean: boolean;
  isOutOfOrder: boolean;
  problems: [string];
}

const RoomSchema = new Schema<IRoom>(
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

export const RoomModel = model<IRoom>("Room", RoomSchema);
