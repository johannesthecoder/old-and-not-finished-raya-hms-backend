import mongoose from "mongoose";

const GuestSchema = new mongoose.Schema(
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
  {
    methods: {
      async processPayment() {
        try {
        } catch (error) {
          throw error;
        }
      },
    },
    collection: "guests",
  }
);

export const GuestModel = mongoose.model("Guest", GuestSchema);
