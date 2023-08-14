import { Document, Schema, model } from "mongoose";
import { notFoundExceptionHandler, unauthorizedExceptionHandler } from "../../core/exceptions";
import { EmployeeModel } from "../auth/models";
import { EmployeeRole, MealPlane } from "../../core/constants";
import { GuestModel } from "../guest/models";
import { RoomModel } from "../room/models";

interface IBook extends Document {
  receptionId: Schema.Types.ObjectId;
  guestId: Schema.Types.ObjectId;
  roomId: Schema.Types.ObjectId;
  mealPlane: MealPlane;
  roomRate: number;
  mealFee: number;
  totalFee: number;
  commission: number;
  bookedAt: Date;
  occupiedDate: Date;
  checkIn: Date;
  checkOut: Date;
  isSettled: boolean;
  replacedBookId: Schema.Types.ObjectId;
  lastUpdatedBy: Schema.Types.ObjectId;
  billPayerId: Schema.Types.ObjectId;
  marketSource: string;
  agent: {
    name: string;
    contact: string;
  };
}

const BookSchema = new Schema<IBook>(
  {
    receptionId: { type: Schema.Types.ObjectId, ref: "employees", required: true },
    guestId: { type: Schema.Types.ObjectId, ref: "guests", required: true },
    roomId: { type: Schema.Types.ObjectId, ref: "rooms", required: true },
    mealPlane: { type: String, enum: Object.values(MealPlane), required: true },
    roomRate: { type: Number, required: true, min: 0 },
    mealFee: { type: Number, default: 0, min: 0 },
    totalFee: {
      type: Number,
      required: true,
      default: function (this: IBook) {
        return this.roomRate + this.mealFee;
      },
    },
    commission: { type: Number, default: 0, min: 0 },
    bookedAt: { type: Date, default: Date.now },
    occupiedDate: { type: Date, default: Date.now },
    checkIn: { type: Date, default: Date.now },
    checkOut: { type: Date, default: Date.now },
    isSettled: { type: Boolean, default: false },
    replacedBookId: { type: Schema.Types.ObjectId, ref: "books" },
    lastUpdatedBy: {
      type: Schema.Types.ObjectId,
      ref: "books",
      default: function (this: IBook) {
        return this.receptionId;
      },
    },
    billPayerId: {
      type: Schema.Types.ObjectId,
      ref: "books",
      default: function (this: IBook) {
        return this.guestId;
      },
    },
    marketSource: { type: String, default: "walk-in", lowercase: true },
    agent: {
      name: { type: String, default: "" },
      contact: { type: String, default: "" },
    },
  },
  { collection: "books" }
);

BookSchema.pre("save", async function (next) {
  await checkReceptionId(this.receptionId);
  await checkGuestId(this.guestId);
  await checkGuestId(this.billPayerId, "billPayer");
  await checkRoomId(this.roomId);
});

async function checkReceptionId(receptionId: any): Promise<boolean> {
  let reception = await EmployeeModel.findOne({ _id: receptionId });

  if (!reception) notFoundExceptionHandler("reception/employee", `id: ${receptionId}`);
  else if (
    ![
      EmployeeRole.ACCOMMODATION_SUPERVISOR,
      EmployeeRole.ADMIN,
      EmployeeRole.GENERAL_MANAGER,
      EmployeeRole.RECEPTION,
    ].includes(reception.role)
  )
    unauthorizedExceptionHandler();
  return true;
}

async function checkGuestId(guestId: any, name: string = "guest"): Promise<boolean> {
  let guest: any = await GuestModel.exists({ _id: guestId });

  if (!guest) notFoundExceptionHandler(name, `id: ${guestId}`);

  return true;
}

async function checkRoomId(roomId: any): Promise<boolean> {
  let room: any = await RoomModel.exists({ _id: roomId });

  if (!room) notFoundExceptionHandler("room", `id: ${roomId}`);

  return true;
}

export const BookModel = model<IBook>("book", BookSchema);
