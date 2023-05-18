import express = require("express");
import {
  ManyGuestsResponseModel,
  GuestBaseModel,
  GuestReadModel,
  SingleGuestResponseModel,
} from "./models";
import {
  globalExceptionHandler,
  missingDataException,
  notFoundException,
  stringToMysqlRegex,
  unknownException,
} from "../../core/utilities";
import { guestController } from "./controller";
import { isDefined, isNumber, isPositiveNumber } from "../../core/checker";
import { HTTPStatusCodes } from "../../core/constants";
export const guestRouter = express.Router();

function queryParameterToMysqlFilter(queryParameter: any): string {
  let filter: string = ``;

  if (isDefined(queryParameter.name, "name", false))
    filter += ` ( firstName LIKE "${stringToMysqlRegex(
      queryParameter.name
    )}" OR lastName LIKE "${stringToMysqlRegex(queryParameter.name)}" ) AND`;

  if (isDefined(queryParameter.phoneNumber, "phoneNumber", false))
    filter += ` phoneNumber LIKE "${stringToMysqlRegex(
      queryParameter.phoneNumber
    )}" AND`;

  if (isDefined(queryParameter.passportNumber, "passportNumber", false))
    filter += ` passportNumber LIKE "${stringToMysqlRegex(
      queryParameter.passportNumber
    )}" AND`;

  if (
    isDefined(
      queryParameter.identificationNumber,
      "identificationNumber",
      false
    )
  )
    filter += ` identificationNumber LIKE "${stringToMysqlRegex(
      queryParameter.identificationNumber
    )}" AND`;

  if (isDefined(queryParameter.nationality, "nationality", false))
    filter += ` nationality LIKE "${stringToMysqlRegex(
      queryParameter.nationality
    )}" AND`;

  if (isDefined(queryParameter.maxBalance, "maxBalance", false))
    filter += ` balance <= ${queryParameter.maxBalance} AND`;

  if (isDefined(queryParameter.minBalance, "minBalance", false))
    filter += ` balance >= ${queryParameter.minBalance} AND`;

  filter = filter ? filter.slice(0, -3) : filter;

  console.log("1 - #######################################");
  console.log(filter);

  return filter;
}

guestRouter.post(
  "/",
  async function (req: express.Request, res: express.Response, next) {
    try {
      let newGuest: GuestBaseModel = GuestBaseModel.fromJson(req.body);

      let insertedGuest = await guestController.getOneById({
        id: await guestController.insertOne({
          newGuest: newGuest,
        }),
      });

      res.status(201).json({
        success: true,
        guest: GuestReadModel.fromJson(insertedGuest),
      } as SingleGuestResponseModel);
    } catch (error: any) {
      if (error.code === "ER_DUP_ENTRY") {
        error.type = "DUPLICATED_ENTRY";
        error.title = "duplicated guest phoneNumber";
        error.statusCode = HTTPStatusCodes.CONFLICT;
      }

      globalExceptionHandler(error, next);
    }
  }
);

guestRouter.get(
  "/:id",
  async function (req: express.Request, res: express.Response, next) {
    try {
      isPositiveNumber(req.params.id, "guestId");

      let guest = await guestController.getOne({
        filter: `id=${Number(req.params.id)} or passportNumber="${
          req.params.id
        }" or identificationNumber="${req.params.id}"`,
      });
      guest.id
        ? res.status(HTTPStatusCodes.OK).json({
            success: true,
            guest: GuestReadModel.fromJson(guest),
          } as SingleGuestResponseModel)
        : res
            .status(HTTPStatusCodes.NOT_FOUND)
            .json(notFoundException("guest", req.query));
    } catch (error: any) {
      globalExceptionHandler(error, next);
    }
  }
);

guestRouter.get(
  "/",
  async function (req: express.Request, res: express.Response, next) {
    try {
      let guests: any[] = await guestController.getMany({
        filter: queryParameterToMysqlFilter(req.query),
        limit: isNaN(Number(req.query.limit))
          ? undefined
          : Number(req.query.limit),
        skip: isNaN(Number(req.query.skip))
          ? undefined
          : Number(req.query.skip),
      });

      guests.length > 0
        ? res.status(HTTPStatusCodes.OK).json({
            success: true,
            guests: guests.map((guest) => GuestReadModel.fromJson(guest)),
            more: {
              resultCount: guests.length,
            },
          } as ManyGuestsResponseModel)
        : res
            .status(HTTPStatusCodes.NOT_FOUND)
            .json(notFoundException("guest", req.query));
    } catch (error: any) {
      globalExceptionHandler(error, next);
    }
  }
);

guestRouter.patch(
  "/info",
  async function (req: express.Request, res: express.Response, next) {
    try {
      let update = {};
      if (isDefined(req.body.firstName, "firstName", false))
        update["firstName"] = req.body.firstName;
      if (isDefined(req.body.lastName, "lastName", false))
        update["lastName"] = req.body.lastName;
      if (isDefined(req.body.phoneNumber, "phoneNumber", false))
        update["phoneNumber"] = req.body.phoneNumber;
      if (isDefined(req.body.passportNumber, "passportNumber", false))
        update["passportNumber"] = req.body.passportNumber;
      if (
        isDefined(req.body.identificationNumber, "identificationNumber", false)
      )
        update["identificationNumber"] = req.body.identificationNumber;
      if (isDefined(req.body.nationality, "nationality", false))
        update["nationality"] = req.body.nationality;

      if (Object.keys(update).length > 0) {
        let updateResult = await guestController.update({
          filter: queryParameterToMysqlFilter(req.query),
          updatedGuest: update,
        });

        if (updateResult.length > 0) {
          let updatedGuests = await guestController.getManyByIds({
            ids: updateResult,
          });
          updatedGuests.length > 0
            ? res.json({
                success: true,
                guest: GuestReadModel.fromJson(updatedGuests),
              } as SingleGuestResponseModel)
            : res.status(HTTPStatusCodes.OK).json({
                success: true,
                guests: updatedGuests.map((guest) =>
                  GuestReadModel.fromJson(guest)
                ),
                more: {
                  resultCount: updatedGuests.length,
                },
              } as ManyGuestsResponseModel);
        } else {
          res
            .status(HTTPStatusCodes.NOT_FOUND)
            .json(notFoundException("guest", req.query));
        }
      } else {
        res
          .status(HTTPStatusCodes.BAD_REQUEST)
          .json(missingDataException("update"));
      }
    } catch (error: any) {
      if (error.code === "ER_DUP_ENTRY") {
        error.type = "DUPLICATED_ENTRY";
        error.title = "duplicated guest phoneNumber";
        error.statusCode = HTTPStatusCodes.CONFLICT;
      }

      globalExceptionHandler(error, next);
    }
  }
);

guestRouter.patch(
  "/info/:id",
  async function (req: express.Request, res: express.Response, next) {
    try {
      isNumber(req.params.id, "id");

      let update = {};
      if (isDefined(req.body.firstName, "firstName", false))
        update["firstName"] = req.body.firstName;
      if (isDefined(req.body.lastName, "lastName", false))
        update["lastName"] = req.body.lastName;
      if (isDefined(req.body.phoneNumber, "phoneNumber", false))
        update["phoneNumber"] = req.body.phoneNumber;
      if (isDefined(req.body.passportNumber, "passportNumber", false))
        update["passportNumber"] = req.body.passportNumber;
      if (
        isDefined(req.body.identificationNumber, "identificationNumber", false)
      )
        update["identificationNumber"] = req.body.identificationNumber;
      if (isDefined(req.body.nationality, "nationality", false))
        update["nationality"] = req.body.nationality;

      if (Object.keys(update).length > 0) {
        let updateResult = await guestController.updateOneById({
          id: Number(req.params.id),
          updatedGuest: update,
        });

        if (updateResult > 0) {
          let updatedGuest = await guestController.getOneById({
            id: Number(req.params.id),
          });
          updatedGuest.id
            ? res.json({
                success: true,
                guest: GuestReadModel.fromJson(updatedGuest),
              } as SingleGuestResponseModel)
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
            .json(notFoundException("guest", req.query));
        }
      } else {
        res
          .status(HTTPStatusCodes.BAD_REQUEST)
          .json(missingDataException("update"));
      }
    } catch (error: any) {
      if (error.code === "ER_DUP_ENTRY") {
        error.type = "DUPLICATED_ENTRY";
        error.title = "duplicated guest phoneNumber";
        error.statusCode = HTTPStatusCodes.CONFLICT;
      }

      globalExceptionHandler(error, next);
    }
  }
);

guestRouter.patch(
  "/balance/:id/:amount",
  async function (req: express.Request, res: express.Response, next) {
    try {
      isNumber(req.params.id, "id");
      isNumber(req.params.id, "amount");

      let updateResult = await guestController.updateBalance({
        id: Number(req.params.id),
        amount: Number(req.params.amount),
      });

      if (updateResult > 0) {
        let updatedGuest = await guestController.getOneById({
          id: Number(req.params.id),
        });
        updatedGuest.id
          ? res.json({
              success: true,
              guest: GuestReadModel.fromJson(updatedGuest),
            } as SingleGuestResponseModel)
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
          .json(notFoundException("guest", req.query));
      }
    } catch (error: any) {
      if (error.code === "ER_DUP_ENTRY") {
        error.type = "DUPLICATED_ENTRY";
        error.title = "duplicated guest phoneNumber";
        error.statusCode = HTTPStatusCodes.CONFLICT;
      }

      globalExceptionHandler(error, next);
    }
  }
);
