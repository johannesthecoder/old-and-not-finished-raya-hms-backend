import { Request, Response, NextFunction } from "express";
import { globalExceptionHandler } from "../../core/exceptions";
import { ErrorType, HTTPStatusCodes, PAGE_SIZE } from "../../core/constants";
import { OrderModel } from "./models";
import {
  getSortingObj,
  isNumber,
  isStringWithValue,
  toBoolean,
  toDate,
} from "../../core/utilities";
import { ErrorResponseModel } from "../../core/models";

function getOrderFilter(query: any) {
  let filter: any = {};

  if (isStringWithValue(query.waiterId)) filter.waiterId = query.waiterId;

  if (isStringWithValue(query.customerId)) filter.customerId = query.customerId;

  if (isStringWithValue(query.status)) filter.status = query.status;

  if (isStringWithValue(query.tableNumber)) filter.tableNumber = query.tableNumber;

  if (isNumber(query.maxTableNumber)) filter.tableNumber = { $lte: Number(query.maxTableNumber) };

  if (isNumber(query.tableNumber)) filter.tableNumber = { $eq: Number(query.tableNumber) };

  if (isNumber(query.minTableNumber)) filter.tableNumber = { $gte: Number(query.minTableNumber) };

  if (toDate(query.postedBefore)) filter.postedAt = { $lte: toDate(query.postedBefore) };

  if (toDate(query.postedAt)) filter.postedAt = { $eq: toDate(query.postedAt) };

  if (toDate(query.postedAfter)) filter.postedAt = { $gte: toDate(query.postedAfter) };

  return filter;
}

export const addOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    let order = new OrderModel(req.body);

    let result = await order.save();

    res.status(HTTPStatusCodes.CREATED).json({
      success: true,
      data: {
        order: result,
        insertedId: result.id,
      },
    });
  } catch (error: any) {
    globalExceptionHandler(error, next);
  }
};

export const findOrderById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let result = await OrderModel.findById(req.params.id);

    res.status(HTTPStatusCodes.OK).json({
      success: true,
      data: {
        order: result,
        filter: { id: req.params.id },
      },
    });
  } catch (error: any) {
    globalExceptionHandler(error, next);
  }
};

export const findOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let filter: any = getOrderFilter(req.query);
    let sort: any = getSortingObj({
      sort: req.query.sort,
      validSortFields: ["postedAt", "status"],
    });
    let skip: number = isNumber(req.query.page) ? (Number(req.query.page) - 1) * PAGE_SIZE : 0;

    let result = await OrderModel.find(filter).sort(sort).skip(skip).limit(PAGE_SIZE);

    res.status(HTTPStatusCodes.OK).json({
      success: true,
      data: {
        order: result,
        filter: req.query,
        length: result.length,
      },
    });
  } catch (error: any) {
    globalExceptionHandler(error, next);
  }
};

export const updateOrderById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let update: any = {};

    if (isStringWithValue(req.body.name)) update.name = req.body.name;

    if (typeof toBoolean(req.body.isAvailable) === "boolean")
      update.isAvailable = toBoolean(req.body.isAvailable);

    if (update.name == null && update.isAvailable == null) {
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
      result = await OrderModel.findByIdAndUpdate(req.params.id, update, {
        returnDocument: "after",
      });

      res.status(HTTPStatusCodes.OK).json({
        success: true,
        data: {
          updatedOrder: result,
          update: update,
          filter: { id: req.params.id },
        },
      });
    }
  } catch (error: any) {
    globalExceptionHandler(error, next);
  }
};
