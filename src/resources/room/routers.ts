import express = require("express");
import {
  ManyRoomsResponseModel,
  RoomBaseModel,
  RoomReadModel,
  SingleRoomResponseModel,
} from "./models";
import {
  globalExceptionHandler,
  missingDataException,
  notFoundException,
  unknownException,
} from "../../core/utilities";
import { roomController } from "./controller";
import {
  isArray,
  isDefined,
  isNumber,
  isPositiveNumber,
  isValidRoomType,
} from "../../core/checker";
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

  if (isDefined(queryParameter.floor, "floor", false))
    filter += ` floor="${queryParameter.floor}" AND`;

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
        room: RoomReadModel.fromJson(insertedRoom),
      } as SingleRoomResponseModel);
    } catch (error: any) {
      if (error.code === "ER_DUP_ENTRY") {
        error.type = "DUPLICATED_ENTRY";
        error.title = "duplicated room phoneNumber";
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

      let room = await roomController.getOne({
        filter: `id=${Number(req.params.id)}`,
      });
      room.id
        ? res.status(HTTPStatusCodes.OK).json({
            success: true,
            room: RoomReadModel.fromJson(room),
          } as SingleRoomResponseModel)
        : res
            .status(HTTPStatusCodes.NOT_FOUND)
            .json(notFoundException("room", req.query));
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

      rooms.length > 0
        ? res.status(HTTPStatusCodes.OK).json({
            success: true,
            rooms: rooms.map((room) => RoomReadModel.fromJson(room)),
            more: {
              resultCount: rooms.length,
            },
          } as ManyRoomsResponseModel)
        : res
            .status(HTTPStatusCodes.NOT_FOUND)
            .json(notFoundException("room", req.query));
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

      if (Object.keys(update).length > 0) {
        let updateResult = await roomController.updateOneById({
          id: Number(req.params.id),
          updatedRoom: update,
        });

        if (updateResult > 0) {
          let updatedRoom = await roomController.getOneById({
            id: Number(req.params.id),
          });
          updatedRoom.id
            ? res.json({
                success: true,
                room: RoomReadModel.fromJson(updatedRoom),
              } as SingleRoomResponseModel)
            : res
                .status(HTTPStatusCodes.INTERNAL_SERVER_ERROR)
                .json(unknownException("updating"));
        } else if (updateResult === -1) {
          res
            .status(HTTPStatusCodes.BAD_REQUEST)
            .json(missingDataException("update"));
        } else {
          res
            .status(HTTPStatusCodes.NOT_FOUND)
            .json(notFoundException("room", req.query));
        }
      } else {
        res
          .status(HTTPStatusCodes.BAD_REQUEST)
          .json(missingDataException("update"));
      }
    } catch (error: any) {
      if (error.code === "ER_DUP_ENTRY") {
        error.type = "DUPLICATED_ENTRY";
        error.title = "duplicated room phoneNumber";
        error.statusCode = HTTPStatusCodes.CONFLICT;
      }

      globalExceptionHandler(error, next);
    }
  }
);
