import { Request, Response, NextFunction } from "express";
import { globalExceptionHandler } from "../../core/exceptions";
import { ErrorType, HTTPStatusCodes, PAGE_SIZE } from "../../core/constants";
import { GuestModel } from "./models";
import { allMatchingRegex, getSortingObj, isNumber, isStringWithValue } from "../../core/utilities";
import { ErrorResponseModel } from "../../core/models";

function getGuestFilter(query: any) {
  let filter: any = {};

  if (isStringWithValue(query.name)) {
    filter.$or = [
      { "name.firstName": { $regex: allMatchingRegex(query.name) } },
      { "name.lastName": { $regex: allMatchingRegex(query.name) } },
    ];
  }

  if (isStringWithValue(query.phoneNumber))
    filter.phoneNumber = { $regex: allMatchingRegex(query.phoneNumber) };

  if (isStringWithValue(query.IDNumber))
    filter.IDNumber = { $regex: allMatchingRegex(query.IDNumber) };

  if (isStringWithValue(query.nationality))
    filter.nationality = { $regex: allMatchingRegex(query.nationality) };

  ["balance", "prePaid", "paidOnUse", "postPaid"].forEach((key) => {
    let newMaxKey: string = "max" + key.charAt(0).toUpperCase() + key.slice(1);
    let newMinKey: string = "min" + key.charAt(0).toUpperCase() + key.slice(1);

    if (isNumber(query[newMaxKey])) filter[key] = { $lte: Number(query[newMaxKey]) };

    if (isNumber(query[key])) filter[key] = { $eq: Number(query[key]) };

    if (isNumber(query[newMinKey])) filter[key] = { $gte: Number(query[newMinKey]) };
  });

  return filter;
}

export const addGuest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    let guest = new GuestModel(req.body);
    let result = await guest.save();

    res.status(HTTPStatusCodes.CREATED).json({
      success: true,
      data: {
        guest: result,
        insertedId: result.id,
      },
    });
  } catch (error: any) {
    globalExceptionHandler(error, next);
  }
};

export const findGuestById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let result = await GuestModel.findById(req.params.id);

    res.status(HTTPStatusCodes.OK).json({
      success: true,
      data: {
        guest: result,
        filter: { id: req.params.id },
      },
    });
  } catch (error: any) {
    globalExceptionHandler(error, next);
  }
};

export const findGuests = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let filter: any = getGuestFilter(req.query);
    let sort: any = getSortingObj(
      {
        sort: req.query.sort,
        validSortFields: [
          "firstName",
          "lastName",
          "phoneNumber",
          "IDNumber",
          "nationality",
          "balance",
          "prePaid",
          "paidOnUse",
          "postPaid",
        ],
      },
      { firstName: "name.firstName", lastName: "name.lastName" }
    );
    let skip: number = isNumber(req.query.page) ? (Number(req.query.page) - 1) * PAGE_SIZE : 0;

    let result = await GuestModel.find(filter).sort(sort).skip(skip).limit(PAGE_SIZE);

    res.status(HTTPStatusCodes.OK).json({
      success: true,
      data: {
        guest: result,
        filter: req.query,
        length: result.length,
      },
    });
  } catch (error: any) {
    globalExceptionHandler(error, next);
  }
};

export const findGuestsBySearchString = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!isStringWithValue(req.query.q))
      throw {
        statusCode: HTTPStatusCodes.BAD_REQUEST,
        errors: [
          {
            type: ErrorType.MISSING_DATA,
            message: "the search string is not given. provide some search string try again.",
          },
        ],
      } as ErrorResponseModel;

    let searchRegEx = allMatchingRegex(req.query.q);
    let filter: any = { $or: [] };
    let skip: number = isNumber(req.query.page) ? (Number(req.query.page) - 1) * PAGE_SIZE : 0;

    ["name.firstName", "name.lastName", "phoneNumber", "IDNumber", "nationality"].forEach(
      (key: string) => {
        filter.$or.push({ [key]: searchRegEx });
      }
    );

    let result = await GuestModel.find(filter).skip(skip).limit(PAGE_SIZE);

    res.status(HTTPStatusCodes.OK).json({
      success: true,
      data: {
        guest: result,
        filter: req.query,
        length: result.length,
      },
    });
  } catch (error: any) {
    globalExceptionHandler(error, next);
  }
};

export const updateGuestInfoById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let update: any = {};

    if (isStringWithValue(req.body.name.firstName)) update.name.firstName = req.body.name.firstName;

    if (isStringWithValue(req.body.name.lastName)) update.name.lastName = req.body.name.lastName;

    if (isStringWithValue(req.body.phoneNumber)) update.phoneNumber = req.body.phoneNumber;

    if (isStringWithValue(req.body.IDNumber)) update.IDNumber = req.body.IDNumber;

    if (isStringWithValue(req.body.nationality)) update.nationality = req.body.nationality;

    if (Object.keys(update).length === 0) {
      throw {
        statusCode: HTTPStatusCodes.BAD_REQUEST,
        errors: [
          {
            type: ErrorType.MISSING_DATA,
            message: "no update was given. add some updates on request body and try again.",
          },
        ],
      } as ErrorResponseModel;
    } else {
      let result: any = {};
      result = await GuestModel.findByIdAndUpdate(req.params.id, update, {
        returnDocument: "after",
      });

      res.status(HTTPStatusCodes.OK).json({
        success: true,
        data: {
          updatedGuest: result,
          update: update,
          filter: { id: req.params.id },
        },
      });
    }
  } catch (error: any) {
    globalExceptionHandler(error, next);
  }
};
