import mongoose from "mongoose";
import { EmployeeRole } from "../../core/constants";
import "../../loadEnvironment.ts";

const bcrypt = require("bcryptjs");

const EmployeeSchema = new mongoose.Schema(
  {
    name: {
      firstName: { type: String, required: true, lowercase: true, trim: true },
      lastName: { type: String, required: true, lowercase: true, trim: true },
    },
    phoneNumber: {
      type: String,
      required: true,
      match: /^[+]?\d{1,3}[ -\s]?\d{5,14}$/i,
      unique: true,
    },
    password: { type: String, required: true },
    isAvailable: { type: Boolean, default: true },
    role: {
      type: String,
      enum: Object.values(EmployeeRole),
      required: true,
    },
  },
  {
    methods: {
      async comparePassword(password) {
        try {
          return await bcrypt.compare(password, this.password);
        } catch (error) {
          throw error;
        }
      },
    },
    collection: "employees",
  }
);

// TODO add attendance fields for the appropriate employees
// TODO add salary counter/tracker working days, advance, shorts....

EmployeeSchema.pre("save", function (next) {
  const user = this;

  if (this.isModified("password") || this.isNew) {
    bcrypt.genSalt(10, function (saltError, salt) {
      if (saltError) {
        return next(saltError);
      } else {
        bcrypt.hash(user.password, salt, function (hashError, hash) {
          if (hashError) {
            return next(hashError);
          }

          user.password = hash;
          next();
        });
      }
    });
  } else {
    return next();
  }
});

export const EmployeeModel = mongoose.model("employee", EmployeeSchema);
