import { Document, Schema, model } from "mongoose";
import { OrderDetailStatus, OrderStatus } from "../../core/constants";
import { EmployeeModel } from "../auth/models";
import { GuestModel } from "../guest/models";
import { MenuItemModel } from "../menuItem/models";
import { notFoundExceptionHandler } from "../../core/exceptions";

interface IOrderDetail extends Document {
  itemId: Schema.Types.ObjectId;
  price: number;
  accompanimentId: Schema.Types.ObjectId;
  status: OrderDetailStatus;
}

interface IOrder extends Document {
  postedAt: Date;
  waiterId: Schema.Types.ObjectId;
  customerId: Schema.Types.ObjectId;
  status: OrderStatus;
  tableNumber: number;
  items: [IOrderDetail];
}

export const OrderDetailSchema = new Schema<IOrderDetail>({
  itemId: { type: Schema.Types.ObjectId, ref: "menuItems", required: true },
  price: { type: Number, required: true },
  accompanimentId: { type: Schema.Types.ObjectId, ref: "menuItems" },
  status: {
    type: String,
    enum: Object.values(OrderDetailStatus),
    default: OrderDetailStatus.PENDING,
  },
});

const OrderSchema = new Schema<IOrder>(
  {
    postedAt: { type: Date, default: Date.now },
    waiterId: { type: Schema.Types.ObjectId, ref: "menuGroups", required: true },
    customerId: { type: Schema.Types.ObjectId },
    status: { type: String, enum: Object.values(OrderStatus), default: OrderStatus.PENDING },
    tableNumber: { type: Number, default: -1 },
    items: [OrderDetailSchema],
  },
  { collection: "orders" }
);

OrderSchema.pre("save", async function (next) {
  await checkWaiterId(this.waiterId);

  if (this.items.length > 0) {
    for (let i = 0; i < this.items.length; i++) {
      await checkItemId(this.items[i].itemId);
      if (this.items[i].accompanimentId) {
        await checkAccompanimentId(this.items[i].itemId, this.items[i].accompanimentId);
      }
    }
  }

  if (this.customerId) await checkCustomerId(this.customerId);
});

async function checkWaiterId(waiterId: any): Promise<boolean> {
  let waiter: any = await EmployeeModel.exists({ _id: waiterId });
  if (!waiter) notFoundExceptionHandler("water/employee", `id: ${waiterId}`);

  return true;
}

async function checkItemId(itemId: any): Promise<boolean> {
  let item: any = await MenuItemModel.exists({ _id: itemId });

  if (!item) notFoundExceptionHandler("menuItem", `id: ${itemId}`);

  return true;
}

// TODO after adding the min and max accompaniment update this function accordingly
async function checkAccompanimentId(itemId: any, accompanimentId: any): Promise<boolean> {
  let accompaniment: any = await MenuItemModel.exists({
    _id: itemId,
    accompaniments: accompanimentId,
  });

  if (!accompaniment) notFoundExceptionHandler("menuItem/accompaniment", `id: ${accompanimentId}`);

  return true;
}

async function checkCustomerId(customerId: any): Promise<boolean> {
  let customer: any = await GuestModel.exists({ _id: customerId });
  if (!customer) notFoundExceptionHandler("customer", `id: ${customerId}`);

  return true;
}

export const OrderModel = model<IOrder>("order", OrderSchema);
