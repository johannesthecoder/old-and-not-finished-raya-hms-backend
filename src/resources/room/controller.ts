import { Request, Response, NextFunction } from "express";
import { globalExceptionHandler, missingDataExceptionHandler } from "../../core/exceptions";
import { HTTPStatusCodes, PAGE_SIZE } from "../../core/constants";
import { RoomModel } from "./models";
import {
  allMatchingRegex,
  getSortingObj,
  isNumber,
  isStringWithValue,
  toBoolean,
} from "../../core/utilities";

function getRoomFilter(query: any) {
  let filter: any = {};

  if (isNumber(query.number)) filter.number = Number(query.number);

  if (isStringWithValue(query.floor)) filter.floor = query.floor;

  if (isStringWithValue(query.type)) filter.type = query.type;

  if (toBoolean(query.isOccupied) != null) filter.isOccupied = toBoolean(query.isOccupied);

  if (toBoolean(query.isClean) != null) filter.isClean = toBoolean(query.isClean);

  if (toBoolean(query.isOutOfOrder) != null) filter.isOutOfOrder = toBoolean(query.isOutOfOrder);

  if (isStringWithValue(query.problems))
    filter.problems = { $regex: allMatchingRegex(query.problems) };

  return filter;
}

export const addRoom = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    let room = new RoomModel(req.body);
    let result = await room.save();

    res.status(HTTPStatusCodes.CREATED).json({
      success: true,
      data: {
        room: result,
        insertedId: result.id,
      },
    });
  } catch (error: any) {
    globalExceptionHandler(error, next);
  }
};

export const findRoomById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let result = await RoomModel.findById(req.params.id);

    res.status(HTTPStatusCodes.OK).json({
      success: true,
      data: {
        room: result,
        filter: { id: req.params.id },
      },
    });
  } catch (error: any) {
    globalExceptionHandler(error, next);
  }
};

export const findRooms = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    let filter: any = getRoomFilter(req.query);
    let sort: any = getSortingObj({
      sort: req.query.sort,
      validSortFields: ["number", "floor", "type", "isOccupied", "isClean", "isOutOfOrder"],
    });
    let skip: number = isNumber(req.query.page) ? (Number(req.query.page) - 1) * PAGE_SIZE : 0;

    let result = await RoomModel.find(filter).sort(sort).skip(skip).limit(PAGE_SIZE);

    res.status(HTTPStatusCodes.OK).json({
      success: true,
      data: {
        room: result,
        filter: req.query,
        length: result.length,
      },
    });
  } catch (error: any) {
    globalExceptionHandler(error, next);
  }
};

export const updateRoomInfoById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let update: any = {};

    if (isNumber(req.body.number)) update.number = Number(req.body.number);

    if (isStringWithValue(req.body.floor)) update.floor = req.body.floor;

    if (isStringWithValue(req.body.type)) update.type = req.body.type;

    if (Object.keys(update).length === 0) {
      missingDataExceptionHandler("updated info");
    } else {
      let result: any = {};
      result = await RoomModel.findByIdAndUpdate(req.params.id, update, {
        returnDocument: "after",
      });

      res.status(HTTPStatusCodes.OK).json({
        success: true,
        data: {
          updatedRoom: result,
          update: update,
          filter: { id: req.params.id },
        },
      });
    }
  } catch (error: any) {
    globalExceptionHandler(error, next);
  }
};

export const updateRoomStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let update: any = {};

    if (toBoolean(req.body.isOccupied) != null) update.isOccupied = toBoolean(req.body.isOccupied);

    if (toBoolean(req.body.isClean) != null) update.isClean = toBoolean(req.body.isClean);

    if (toBoolean(req.body.isOutOfOrder) != null)
      update.isOutOfOrder = toBoolean(req.body.isOutOfOrder);

    if (Object.keys(update).length === 0) {
      missingDataExceptionHandler("updated info");
    } else {
      let result: any = {};
      if (isStringWithValue(req.params.id)) {
        result = await RoomModel.findByIdAndUpdate(req.params.id, update, {
          returnDocument: "after",
        });
      } else {
        let filter: any = getRoomFilter(req.query);

        result = await RoomModel.updateMany(filter, update, { returnDocument: "after" });
      }

      res.status(HTTPStatusCodes.OK).json({
        success: true,
        data: {
          modifiedCount: result.modifiedCount,
          matchedCount: result.matchedCount,
          update: update,
          filter: { ...req.query, id: req.params.id },
        },
      });
    }
  } catch (error: any) {
    globalExceptionHandler(error, next);
  }
};

export const roomIssueTrackerById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let update: any = {};

    if (toBoolean(req.body.isOutOfOrder) != null)
      update.isOutOfOrder = toBoolean(req.body.isOutOfOrder);

    if (Array.isArray(req.body.problems)) update.problems = req.body.problems;

    if (Object.keys(update).length === 0) {
      missingDataExceptionHandler("updated info");
    } else {
      let result: any = {};
      result = await RoomModel.findByIdAndUpdate(req.params.id, update, {
        returnDocument: "after",
      });

      res.status(HTTPStatusCodes.OK).json({
        success: true,
        data: {
          updatedRoom: result,
          update: update,
          filter: { id: req.params.id },
        },
      });
    }
  } catch (error: any) {
    globalExceptionHandler(error, next);
  }
};
