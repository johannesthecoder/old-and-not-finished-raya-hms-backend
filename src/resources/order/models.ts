import mongoose from "mongoose";
import { ErrorType, HTTPStatusCodes, OrderDetailStatus, OrderStatus } from "../../core/constants";
import { ErrorResponseModel } from "../../core/models";
import { EmployeeModel } from "../auth/models";
import { GuestModel } from "../guest/models";
import { isStringWithValue } from "../../core/utilities";

const OrderDetailSchema = new mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: "menuItems", required: true },
  accompanimentId: { type: mongoose.Schema.Types.ObjectId, ref: "menuItems" },
  status: { type: String, enum: Object.values(OrderDetailStatus) },
});

const OrderSchema = new mongoose.Schema(
  {
    postedAt: { type: Date, default: Date() },
    waiterId: { type: mongoose.Schema.Types.ObjectId, ref: "menuGroups", required: true },
    customerId: { type: mongoose.Schema.Types.ObjectId },
    status: { type: String, enum: Object.values(OrderStatus), default: OrderStatus.PENDING },
    tableNumber: { type: Number, default: -1 },
    items: [OrderDetailSchema],
  },
  { collection: "orders" }
);

OrderSchema.pre("save", async function (next) {
  await checkWaiterId(this.waiterId);
  if (isStringWithValue(this.customerId)) await checkCustomerId(this.customerId);
});

async function checkWaiterId(waiterId: any): Promise<boolean> {
  let waiter: any = await EmployeeModel.findById(waiterId);
  if (!waiter) {
    throw {
      statusCode: HTTPStatusCodes.NOT_FOUND,
      errors: [
        {
          type: ErrorType.NOT_FOUND,
          message: `there is no employee/waiter with an id=${waiterId}. provide a valid employee/waiter id and try again.`,
        },
      ],
    } as ErrorResponseModel;
  } else {
    return true;
  }
}
async function checkCustomerId(customerId: any): Promise<boolean> {
  let customer: any = await GuestModel.findById(customerId);
  if (!customer) {
    throw {
      statusCode: HTTPStatusCodes.NOT_FOUND,
      errors: [
        {
          type: ErrorType.NOT_FOUND,
          message: `there is no guest/customer with an id=${customerId}. provide a valid customer/customer id and try again.`,
        },
      ],
    } as ErrorResponseModel;
  } else {
    return true;
  }
}

export const OrderModel = mongoose.model("order", OrderSchema);
