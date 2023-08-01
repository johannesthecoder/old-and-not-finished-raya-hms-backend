import mongoose from "mongoose";
import { ErrorType, HTTPStatusCodes } from "../../core/constants";
import { ErrorResponseModel } from "../../core/models";
import { MenuGroupModel } from "../menuGroup/models";

const MenuItemSchema = new mongoose.Schema(
  {
    name: { type: String, lowercase: true, required: true, unique: true },
    price: { type: Number, required: true, min: 0 },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "menuGroups",
      required: true,
    },
    isAccompaniment: { type: Boolean, default: false },
    accompaniments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        minLength: 24,
        maxLength: 24,
        default: [],
      },
    ],
    isAvailable: { type: Boolean, default: true },
  },
  { collection: "menuItems" }
);

MenuItemSchema.pre("save", async function (next) {
  await checkGroupId(this.groupId);
  await getInvalidAccompanimentIds(this.accompaniments);
});

async function checkGroupId(groupId: any): Promise<boolean> {
  let group: any = await MenuGroupModel.findById(groupId);
  if (!group) {
    throw {
      statusCode: HTTPStatusCodes.NOT_FOUND,
      errors: [
        {
          type: ErrorType.NOT_FOUND,
          message: `there is no menu group with an id=${groupId}. provide a valid group id and try again.`,
        },
      ],
    } as ErrorResponseModel;
  } else {
    return true;
  }
}

async function getInvalidAccompanimentIds(
  accompanimentIds: any[]
): Promise<boolean> {
  for (let i = 0; i < accompanimentIds.length; i++) {
    if (
      !(await MenuItemModel.findOne({
        _id: accompanimentIds[i],
        isAccompaniment: true,
      }))
    )
      throw {
        statusCode: HTTPStatusCodes.BAD_REQUEST,
        errors: [
          {
            type: ErrorType.INVALID_DATA,
            message: `there is no accompaniment/menu item with an id=${accompanimentIds[i]}. provide a valid accompaniment/menu item id and try again.`,
          },
        ],
      } as ErrorResponseModel;
  }

  return true;
}

// EmployeeSchema.pre("save", function (next) {
//   const user = this;

//   if (this.isModified("password") || this.isNew) {
//     bcrypt.genSalt(10, function (saltError, salt) {
//       if (saltError) {
//         return next(saltError);
//       } else {
//         bcrypt.hash(user.password, salt, function (hashError, hash) {
//           if (hashError) {
//             return next(hashError);
//           }

//           user.password = hash;
//           next();
//         });
//       }
//     });
//   } else {
//     return next();
//   }
// });

export const MenuItemModel = mongoose.model("menuItem", MenuItemSchema);
