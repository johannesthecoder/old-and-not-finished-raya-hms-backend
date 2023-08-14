import { Request, Response, NextFunction } from "express";
import {
  globalExceptionHandler,
  missingDataExceptionHandler,
  notFoundExceptionHandler,
} from "../../core/exceptions";
import { ErrorType, HTTPStatusCodes, PAGE_SIZE } from "../../core/constants";
import { MenuGroupModel } from "./models";
import {
  allMatchingRegex,
  getSortingObj,
  isNumber,
  isStringWithValue,
  toBoolean,
} from "../../core/utilities";

export const addMenuGroup = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let menuGroup = new MenuGroupModel(req.body);
    let result = await menuGroup.save();

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

export const findMenuGroupById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let menuGroup = await MenuGroupModel.findById(req.params.id);

    if (!menuGroup) notFoundExceptionHandler("menuGroup", `id: ${req.params.id}`);

    res.status(HTTPStatusCodes.OK).json({
      success: true,
      data: {
        menuGroup: menuGroup,
        filter: { id: req.params.id },
      },
    });
  } catch (error: any) {
    globalExceptionHandler(error, next);
  }
};

export const findMenuGroups = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let filter: any = {};
    let sort: any = getSortingObj({
      sort: req.query.sort,
      validSortFields: ["name"],
    });
    let skip: number = isNumber(req.query.page) ? (Number(req.query.page) - 1) * PAGE_SIZE : 0;

    if (isStringWithValue(req.query.name))
      filter.name = { $regex: allMatchingRegex(req.query.name) };

    if (typeof toBoolean(req.query.isAvailable) === "boolean")
      filter.isAvailable = toBoolean(req.query.isAvailable);

    let menuGroups = await MenuGroupModel.find(filter).sort(sort).skip(skip).limit(PAGE_SIZE);
    if (!menuGroups) notFoundExceptionHandler("menuGroups", `the provided filter`);

    res.status(HTTPStatusCodes.OK).json({
      success: true,
      data: {
        menuGroups: menuGroups,
        filter: req.query,
        length: menuGroups.length,
      },
    });
  } catch (error: any) {
    globalExceptionHandler(error, next);
  }
};

export const updateMenuGroupById = async (
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
      result = await MenuGroupModel.findByIdAndUpdate(req.params.id, update, {
        returnDocument: "after",
      });

      res.status(HTTPStatusCodes.OK).json({
        success: true,
        data: {
          updatedMenuGroup: result,
          update: update,
          filter: { id: req.params.id },
        },
      });
    }
  } catch (error: any) {
    globalExceptionHandler(error, next);
  }
};
