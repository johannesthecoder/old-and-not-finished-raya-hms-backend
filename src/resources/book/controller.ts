import { Request, Response, NextFunction } from "express";
import {
  globalExceptionHandler,
  missingDataExceptionHandler,
  notFoundExceptionHandler,
} from "../../core/exceptions";
import { HTTPStatusCodes, PAGE_SIZE } from "../../core/constants";
import { BookModel } from "./models";
import {
  allMatchingRegex,
  findDifferences,
  getSortingObj,
  isNumber,
  isStringWithValue,
  toDate,
} from "../../core/utilities";

function getBookFilter(query: any) {
  let filter: any = {};

  let stringKeys = ["receptionId", "guestId", "roomId", "marketSource", "mealPlane"];
  let numberKeys = [
    { column: "roomRate", query: "RoomRate" },
    { column: "mealFee", query: "MealFee" },
    { column: "totalFee", query: "TotalFee" },
    { column: "commission", query: "Commission" },
  ];
  let dateKeys = [
    { fieldName: "bookedAt", queryName: "booked" },
    { fieldName: "occupiedDate", queryName: "occupied" },
    { fieldName: "checkIn", queryName: "checkIn" },
    { fieldName: "checkOut", queryName: "checkOut" },
  ];

  stringKeys.forEach((key) => {
    if (isStringWithValue(query[key])) filter[key] = query[key];
  });

  numberKeys.forEach((keys) => {
    if (isNumber(query[`max${keys.query}`]))
      filter[keys.column] = { $lte: Number(query[`max${keys.query}`]) };

    if (isNumber(query[keys.column])) filter[keys.column] = { $eq: Number(query[keys.column]) };

    if (isNumber(query[`min${keys.query}`]))
      filter[keys.column] = { $gte: Number(query[`min${keys.query}`]) };
  });

  dateKeys.forEach((fieldKeys) => {
    if (toDate(query[`${fieldKeys.queryName}Before`]))
      filter[fieldKeys.fieldName] = { $lte: toDate(query[`${fieldKeys.queryName}Before`]) };

    if (toDate(query[fieldKeys.fieldName]))
      filter[fieldKeys.fieldName] = { $eq: toDate(query[fieldKeys.fieldName]) };

    if (toDate(query[`${fieldKeys.queryName}After`]))
      filter[fieldKeys.fieldName] = { $lte: toDate(query[`${fieldKeys.queryName}After`]) };
  });

  return filter;
}

export const addBook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    let book = new BookModel({
      ...req.body,
      receptionId: req.body.$user.userId,
      lastUpdatedBy: req.body.$user.userId,
    });
    let result = await book.save();

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

export const findBookById = async (
  req: Request,

  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let book = await BookModel.findById(req.params.id);

    if (!book) notFoundExceptionHandler("book", `id: ${req.params.id}`);

    res.status(HTTPStatusCodes.OK).json({
      success: true,
      data: {
        book: book,
        filter: { id: req.params.id },
      },
    });
  } catch (error: any) {
    globalExceptionHandler(error, next);
  }
};

export const findBooks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    let filter: any = getBookFilter(req.query);
    console.log("🚀 ~ file: controller.ts:114 ~ findBooks ~ filter:", filter);
    let sort: any = getSortingObj({
      sort: req.query.sort,
      validSortFields: ["name"],
    });

    let skip: number = isNumber(req.query.page) ? (Number(req.query.page) - 1) * PAGE_SIZE : 0;

    let books = await BookModel.find(filter).sort(sort).skip(skip).limit(PAGE_SIZE);

    if (!books || books.length === 0) notFoundExceptionHandler("books", `the provided filter`);

    res.status(HTTPStatusCodes.OK).json({
      success: true,
      data: {
        books: books,
        filter: req.query,
        length: books.length,
      },
    });
  } catch (error: any) {
    globalExceptionHandler(error, next);
  }
};

export const updateBookById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let update: any = {};
    let mutableFields = [
      "guestId",
      "roomId",
      "marketSource",
      "roomRate",
      "mealFee",
      "commission",
      "occupiedDate",
      "checkIn",
      "checkOut",
      "billPayerId",
    ];

    mutableFields.forEach((field) => {
      if (field in req.body && req.body[field] !== undefined && req.body[field] !== null) {
        update[field] = req.body[field];
      }
    });

    if (!Object.keys(update).length) {
      missingDataExceptionHandler("updated info");
    } else {
      let oldBook = await BookModel.findById(req.params.id);

      let updatedBook = new BookModel({
        ...oldBook?.toJSON(),
        ...update,
        _id: undefined,
        replacedBookId: req.params.id,
        receptionId: req.body.$user.userId,
        lastUpdatedBy: req.body.$user.userId,
      });

      let difference = findDifferences(oldBook?.toObject(), updatedBook.toObject());

      if (Object.keys(difference).length !== 0) await updatedBook.save();
      else missingDataExceptionHandler("different from the current data");

      res.status(HTTPStatusCodes.OK).json({
        success: true,
        data: {
          updatedBook: updatedBook,
          update: update,
          filter: { id: req.params.id },
        },
      });
    }
  } catch (error: any) {
    globalExceptionHandler(error, next);
  }
};
