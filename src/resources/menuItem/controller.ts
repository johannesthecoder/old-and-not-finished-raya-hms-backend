import { Request, Response, NextFunction } from "express";
import {
  globalExceptionHandler,
  missingDataExceptionHandler,
  notFoundExceptionHandler,
} from "../../core/exceptions";
import { HTTPStatusCodes, PAGE_SIZE } from "../../core/constants";
import { MenuItemModel } from "./models";
import {
  allMatchingRegex,
  getSortingObj,
  isNumber,
  isStringWithValue,
  toBoolean,
} from "../../core/utilities";

export const addMenuItem = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let menuItem = new MenuItemModel(req.body);

    let result = await menuItem.save();

    res.status(HTTPStatusCodes.CREATED).json({
      success: true,
      data: {
        menuItem: result,
        insertedId: result.id,
      },
    });
  } catch (error: any) {
    globalExceptionHandler(error, next);
  }
};

export const findMenuItemById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let menuItem = await MenuItemModel.findById(req.params.id);

    if (!menuItem) notFoundExceptionHandler("menuItem", `id: ${req.params.id}`);

    res.status(HTTPStatusCodes.OK).json({
      success: true,
      data: {
        menuItem: menuItem,
        filter: { id: req.params.id },
      },
    });
  } catch (error: any) {
    globalExceptionHandler(error, next);
  }
};

export const findMenuItems = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let filter: any = {};
    let sort: any = getSortingObj({
      sort: req.query.sort,
      validSortFields: ["name", "price", "isAccompaniment"],
    });
    let skip: number = isNumber(req.query.page) ? (Number(req.query.page) - 1) * PAGE_SIZE : 0;

    if (isStringWithValue(req.query.name))
      filter.name = { $regex: allMatchingRegex(req.query.name) };

    if (typeof toBoolean(req.query.isAvailable) === "boolean")
      filter.isAvailable = toBoolean(req.query.isAvailable);

    let menuItems = await MenuItemModel.find(filter).sort(sort).skip(skip).limit(PAGE_SIZE);

    if (!menuItems) notFoundExceptionHandler("menuItems", `id: ${req.params.id}`);

    res.status(HTTPStatusCodes.OK).json({
      success: true,
      data: {
        menuItem: menuItems,
        filter: req.query,
        length: menuItems.length,
      },
    });
  } catch (error: any) {
    globalExceptionHandler(error, next);
  }
};

export const updateMenuItemById = async (
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
      missingDataExceptionHandler("updated info");
    } else {
      let result: any = {};
      result = await MenuItemModel.findByIdAndUpdate(req.params.id, update, {
        returnDocument: "after",
      });

      res.status(HTTPStatusCodes.OK).json({
        success: true,
        data: {
          updatedMenuItem: result,
          update: update,
          filter: { id: req.params.id },
        },
      });
    }
  } catch (error: any) {
    globalExceptionHandler(error, next);
  }
};
