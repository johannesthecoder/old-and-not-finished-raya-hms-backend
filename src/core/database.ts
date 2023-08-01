import "../loadEnvironment";
import { ErrorType, HTTPStatusCodes } from "./constants";
import { ErrorResponseModel } from "./models";

const mongoose = require("mongoose");

export const connectDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("successfully connected to mongo database. let's go 🚀🚀🚀");
  } catch (error: any) {
    console.error(error);

    throw {
      success: false,
      statusCode: HTTPStatusCodes.INTERNAL_SERVER_ERROR,
      errors: [
        {
          type: ErrorType.INTERNAL_SERVER_ERROR,
          message: `could not connect to the database`,
        },
      ],
    } as ErrorResponseModel;
  }
};
