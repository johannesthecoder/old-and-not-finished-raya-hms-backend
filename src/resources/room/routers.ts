import express = require("express");
import {
  ManyRoomsResponseModel,
  RoomBaseModel,
  RoomReadModel,
  SingleRoomResponseModel,
} from "./models";
import { globalExceptionHandler } from "../../core/utilities";
import { roomController } from "./controller";
import {
  isArray,
  isDefined,
  isNumber,
  isPositiveNumber,
  isValidRoomType,
} from "../../core/checker";
import { ErrorResponseModel } from "../../core/shared_models";
import { HTTPStatusCodes } from "../../core/constants";
export const roomRouter = express.Router();

function queryParameterToMysqlFilter(queryParameter: any): string {
  let filter: string = ``;

  if (
    isDefined(queryParameter.roomNumber, "roomNumber", false) &&
    isPositiveNumber(queryParameter.roomNumber, "roomNumber")
  )
    filter += ` roomNumber=${Number(queryParameter.roomNumber)} AND`;

  if (
    isDefined(queryParameter.roomType, "roomType", false) &&
    isValidRoomType(queryParameter.roomType, "roomType")
  )
    filter += ` roomType="${queryParameter.roomType}" AND`;

  if (isDefined(queryParameter.isOccupied, "isOccupied", false))
    filter += ` isOccupied=${queryParameter.isOccupied} AND`;

  if (isDefined(queryParameter.isClean, "isClean", false))
    filter += ` isClean=${queryParameter.isClean} AND`;

  if (isDefined(queryParameter.isOutOfOrder, "isOutOfOrder", false))
    filter += ` isOutOfOrder=${queryParameter.isOutOfOrder} AND`;

  filter = filter ? filter.slice(0, -3) : filter;

  return filter;
}

roomRouter.post(
  "/",
  async function (req: express.Request, res: express.Response, next) {
    try {
      let newRoom: RoomBaseModel = RoomBaseModel.fromJson(req.body);

      let insertedRoom = await roomController.getOneById({
        id: await roomController.insertOne({
          newRoom: newRoom,
        }),
      });

      res.status(201).json({
        success: true,
        room: { ...insertedRoom } as RoomReadModel,
      } as SingleRoomResponseModel);
    } catch (error: any) {
      if (error.code === "ER_DUP_ENTRY") {
        error.type = "DUPLICATED_ENTRY";
        error.title = "duplicated room number";
        error.statusCode = HTTPStatusCodes.CONFLICT;
      }

      globalExceptionHandler(error, next);
    }
  }
);

roomRouter.get(
  "/:id",
  async function (req: express.Request, res: express.Response, next) {
    try {
      isPositiveNumber(req.params.id, "roomId");

      let room = await roomController.getOneById({
        id: Number(req.params.id),
      });

      res.json(
        room.id
          ? ({
              success: true,
              room: { ...room } as RoomReadModel,
            } as SingleRoomResponseModel)
          : ({
              success: false,
              type: "NOT_FOUND",
              title: "room not found",
              message: `room with an id: ${req.params.id} doesn't exist in this database.`,
              statusCode: HTTPStatusCodes.NOT_FOUND,
            } as ErrorResponseModel)
      );
    } catch (error: any) {
      globalExceptionHandler(error, next);
    }
  }
);

roomRouter.get(
  "/",
  async function (req: express.Request, res: express.Response, next) {
    try {
      let rooms: any[] = await roomController.getMany({
        filter: queryParameterToMysqlFilter(req.query),
        limit: isNaN(Number(req.query.limit))
          ? undefined
          : Number(req.query.limit),
        skip: isNaN(Number(req.query.skip))
          ? undefined
          : Number(req.query.skip),
      });

      res.json(
        rooms.length > 0
          ? ({
              success: true,
              rooms: rooms.map((room) => RoomReadModel.fromJson(room)),
              more: {
                matchedCount: rooms.length,
              },
            } as ManyRoomsResponseModel)
          : ({
              success: false,
              type: "NOT_FOUND",
              title: "room not found",
              message: `room with the given filter doesn't exist in this database.`,
              statusCode: HTTPStatusCodes.NOT_FOUND,
            } as ErrorResponseModel)
      );
    } catch (error: any) {
      globalExceptionHandler(error, next);
    }
  }
);

roomRouter.patch(
  "/status/:id",
  async function (req: express.Request, res: express.Response, next) {
    try {
      isNumber(req.params.id, "id");

      let update = {};
      if (isDefined(req.body.isOccupied, "isOccupied", false))
        update["isOccupied"] = Boolean(req.body.isOccupied);
      if (isDefined(req.body.isClean, "isClean", false))
        update["isClean"] = Boolean(req.body.isClean);
      if (isDefined(req.body.isOutOfOrder, "isOutOfOrder", false))
        update["isOutOfOrder"] = Boolean(req.body.isOutOfOrder);
      if (
        isDefined(req.body.problems, "problems", false) &&
        isArray(req.body.problems, "problems", false)
      )
        update["problems"] = req.body.problems;

      let updateResult = await roomController.updateOneById({
        id: Number(req.params.id),
        updatedRoom: update,
      });

      if (updateResult > 0) {
      } else {
        let updatedRoom: any[] = await roomController.getOneById({
          id: Number(req.params.id),
        });

        res.json(
          updatedRoom
            ? ({
                success: true,
                room: RoomReadModel.fromJson(updatedRoom),
              } as SingleRoomResponseModel)
            : ({
                success: false,
                type: "NOT_FOUND",
                title: "room not found",
                message: `room with an id: ${req.params.id} doesn't exist in this database.`,
                statusCode: HTTPStatusCodes.NOT_FOUND,
              } as ErrorResponseModel)
        );
      }
    } catch (error: any) {
      if (error.code === "ER_DUP_ENTRY") {
        error.type = "DUPLICATED_ENTRY";
        error.title = "duplicated room number";
        error.statusCode = HTTPStatusCodes.CONFLICT;
      }

      globalExceptionHandler(error, next);
    }
  }
);
