import { Document, Schema, model } from "mongoose";

interface IMenuGroup extends Document {
  name: string;
  isAvailable: boolean;
}

const MenuGroupSchema = new Schema<IMenuGroup>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    isAvailable: { type: Boolean, default: true },
  },
  { collection: "menuGroups" }
);

export const MenuGroupModel = model<IMenuGroup>("menuGroup", MenuGroupSchema);
