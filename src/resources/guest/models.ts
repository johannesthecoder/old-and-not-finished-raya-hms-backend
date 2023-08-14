import { Document, Schema, model } from "mongoose";

interface IGuest extends Document {
  name: {
    firstName: string;
    lastName: string;
  };
  phoneNumber: string;
  IDNumber: string;
  nationality: string;
  balance: number;
  prePaid: number;
  paidOnUse: number;
  postPaid: number;
}

const GuestSchema = new Schema<IGuest>(
  {
    name: {
      firstName: { type: String, required: true, lowercase: true, trim: true },
      lastName: { type: String, required: true, lowercase: true, trim: true },
      middleName: { type: String, lowercase: true, trim: true },
    },
    phoneNumber: {
      type: String,
      required: true,
      match: /^[+]?\d{1,3}[ -\s]?\d{5,14}$/i,
      unique: true,
    },
    IDNumber: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    nationality: { type: String, required: true, lowercase: true, trim: true },
    balance: { type: Number, default: 0 },
    prePaid: { type: Number, default: 0 },
    paidOnUse: { type: Number, default: 0 },
    postPaid: { type: Number, default: 0 },
  },
  { collection: "guests" }
);

export const GuestModel = model<IGuest>("Guest", GuestSchema);
