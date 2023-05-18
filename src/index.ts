import express = require("express");
import dotenv = require("dotenv");
import cors = require("cors");
const helmet = require("helmet");

import { authRouter } from "./resources/auth/routers";
import { roomRouter } from "./resources/room/routers";
import { guestRouter } from "./resources/guest/routers";
import { ErrorResponseModel } from "./core/shared_models";
import { HTTPStatusCodes } from "./core/constants";

dotenv.config();
if (!process.env.PORT) {
  process.exit(1);
}

const PORT = process.env.PORT;
const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/auth", authRouter);
app.use("/room", roomRouter);
app.use("/guest", guestRouter);

app.get("/", function (request: express.Request, response: express.Response) {
  response.json({
    success: true,
    message:
      "what a useless man. you just turned 24 and you still live with your parents and have no income!! :)",
  });
});

app.all("*", (req, _res, next) => {
  const error: ErrorResponseModel = {
    success: false,
    type: "NOT_FOUND",
    title: "this url is not available",
    message: `can't find '${req.originalUrl}' on this server.`,
    statusCode: HTTPStatusCodes.NOT_FOUND,
    more: {
      suggestions: [
        "check the method used [GET, POST, PATCH, PUT, DELETE, ...]",
        `check for spelling error on the url='${req.originalUrl}'`,
      ],
    },
  };

  next(error);
});

app.use((error: ErrorResponseModel, _req, res, _next) => {
  error.success = error.success || false;
  error.type = error.type || "UNKNOWN";
  error.title = error.title || "unknown/unexpected error happened";
  error.message =
    error.message ||
    "unknown/unexpected error happened. check your request or contact the admin!";
  error.statusCode = error.statusCode || HTTPStatusCodes.INTERNAL_SERVER_ERROR;

  res.status(error.statusCode).json({
    success: error.success,
    type: error.type,
    title: error.title,
    message: error.message,
    statusCode: error.statusCode,
    more: error.more,
  } as ErrorResponseModel);
});

app.listen(PORT, () => {
  console.log(`[server]: Server is running at http://localhost:${PORT}`);
});
