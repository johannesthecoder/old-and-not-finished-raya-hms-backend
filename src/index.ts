import express = require("express");
import cors = require("cors");
import { ErrorResponseModel } from "./core/models";
import { ErrorType, HTTPStatusCodes } from "./core/constants";
import "./loadEnvironment.ts";
import { connectDatabase } from "./core/database";
import { authRouter } from "./resources/auth/routers";
import { roomRouter } from "./resources/room/routers";
import { guestRouter } from "./resources/guest/routers";
import { menuGroupRouter } from "./resources/menuGroup/routers";
import { menuItemRouter } from "./resources/menuItem/routers";
import { orderRouter } from "./resources/order/routers";

const helmet = require("helmet");

if (!process.env.PORT) {
  process.exit(1);
}

const PORT = process.env.PORT;
const app = express();

connectDatabase();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/auth", authRouter);
app.use("/room", roomRouter);
app.use("/guest", guestRouter);
app.use("/menu/item", menuItemRouter);
app.use("/menu/group", menuGroupRouter);
app.use("/order", orderRouter);

app.get("/", async function (request: express.Request, response: express.Response, next) {
  response.json({
    success: true,
    message:
      "what a useless man. you just turned 24 and you still live with your parents and have no income!! :)",
  });
});

app.all("*", (req, _res, next) => {
  const error: ErrorResponseModel = {
    success: false,
    statusCode: HTTPStatusCodes.NOT_FOUND,
    errors: [
      {
        type: ErrorType.NOT_FOUND,
        message: `can't find '${req.originalUrl}' on this server.`,
        detail: {
          suggestions: [
            "check the method used [GET, POST, PATCH, PUT, DELETE, ...]",
            `check for spelling error on the url='${req.originalUrl}'`,
          ],
        },
      },
    ],
  } as ErrorResponseModel;

  next(error);
});

app.use((error: ErrorResponseModel, _req, res, _next) => {
  res.status(error.statusCode).json(error);
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT} 🚀`);
});
