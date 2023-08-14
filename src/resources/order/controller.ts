import { Request, Response, NextFunction } from "express";
import {
  globalExceptionHandler,
  missingDataExceptionHandler,
  notFoundExceptionHandler,
  unknownExceptionHandler,
} from "../../core/exceptions";
import { HTTPStatusCodes, PAGE_SIZE } from "../../core/constants";
import { OrderModel } from "./models";
import { getSortingObj, isNumber, isStringWithValue, toDate } from "../../core/utilities";
import { MenuItemModel } from "../menuItem/models";

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

    if (!order.items.length) missingDataExceptionHandler("items");

    for (let i = 0; i < order.items.length; i++) {
      const menuItem = await MenuItemModel.findById(order.items[i].itemId);
      order.items[i].price = menuItem?.price ?? 0;
    }

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
    let order = await OrderModel.findById(req.params.id);

    if (!order) notFoundExceptionHandler("order", `id: ${req.params.id}`);

    res.status(HTTPStatusCodes.OK).json({
      success: true,
      data: {
        order: order,
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

    let orders = await OrderModel.find(filter).sort(sort).skip(skip).limit(PAGE_SIZE);

    if (!orders) notFoundExceptionHandler("orders", `the provided filter`);

    res.status(HTTPStatusCodes.OK).json({
      success: true,
      data: {
        order: orders,
        filter: req.query,
        length: orders.length,
      },
    });
  } catch (error: any) {
    globalExceptionHandler(error, next);
  }
};

export const addItemToAnOrderById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!Array.isArray(req.body.items)) missingDataExceptionHandler("items");

    let newItems = req.body.items;

    for (let i = 0; i < newItems.length; i++) {
      const menuItem = await MenuItemModel.findById(newItems[i].itemId);
      newItems[i].price = menuItem?.price ?? 0;
    }

    let order = await OrderModel.findById(req.params.id);

    if (!order) notFoundExceptionHandler("items", `id=${req.params.id}`);
    else {
      order.items.push(...newItems);

      await order.save();

      if (!order) unknownExceptionHandler();

      res.status(HTTPStatusCodes.OK).json({
        success: true,
        data: {
          updatedOrder: order,
          update: { items: req.body.items },
          filter: { id: req.params.id },
        },
      });
    }
  } catch (error: any) {
    globalExceptionHandler(error, next);
  }
};

// TODO splitOrder
// TODO mergeOrders
// TODO transferOrder
// this can be to a customer or an employee
