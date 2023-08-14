import { Document, Schema, model } from "mongoose";
import { MenuGroupModel } from "../menuGroup/models";
import { notFoundExceptionHandler } from "../../core/exceptions";

interface IMenuItem extends Document {
  name: string;
  price: number;
  groupId: Schema.Types.ObjectId;
  isAccompaniment: boolean;
  accompaniments: [Schema.Types.ObjectId];
  isAvailable: boolean;
}

const MenuItemSchema = new Schema<IMenuItem>(
  {
    name: { type: String, lowercase: true, required: true, unique: true },
    price: { type: Number, required: true, min: 0 },
    groupId: { type: Schema.Types.ObjectId, ref: "menuGroups", required: true },
    isAccompaniment: { type: Boolean, default: false },
    accompaniments: [
      {
        type: Schema.Types.ObjectId,
        minLength: 24,
        maxLength: 24,
        default: [],
      },
    ],
    isAvailable: { type: Boolean, default: true },
  },
  { collection: "menuItems" }
);

// [ ] add field minAccompaniment: number

MenuItemSchema.pre("save", async function (next) {
  await checkGroupId(this.groupId);
  await getInvalidAccompanimentIds(this.accompaniments);
});

async function checkGroupId(groupId: any): Promise<boolean> {
  let group: any = await MenuGroupModel.findById(groupId);

  if (!group) notFoundExceptionHandler("group", `id: ${groupId}`);

  return true;
}

async function getInvalidAccompanimentIds(accompanimentIds: any[]): Promise<boolean> {
  for (let i = 0; i < accompanimentIds.length; i++) {
    if (
      !(await MenuItemModel.findOne({
        _id: accompanimentIds[i],
        isAccompaniment: true,
      }))
    )
      notFoundExceptionHandler(
        "accompaniment",
        `{ id: ${accompanimentIds[i]}, isAccompaniment: true }`
      );
  }

  return true;
}

export const MenuItemModel = model<IMenuItem>("menuItem", MenuItemSchema);
