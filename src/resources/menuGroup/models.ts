import mongoose from "mongoose";

const MenuGroupSchema = new mongoose.Schema(
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

export const MenuGroupModel = mongoose.model("menuGroup", MenuGroupSchema);
