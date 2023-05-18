import { isDefined, isNumber } from "../../core/checker";

export class GuestBaseModel {
  constructor(
    public firstName: string,
    public lastName: string,
    public phoneNumber: string,
    public passportNumber: string,
    public identificationNumber: string,
    public nationality: string,
    public balance: number
  ) {}

  public static fromJson(jsonGuest: any): GuestBaseModel {
    isDefined(jsonGuest.firstName, "firstName");
    isDefined(jsonGuest.lastName, "lastName");
    isDefined(jsonGuest.phoneNumber, "phoneNumber");
    if (
      !(
        isDefined(jsonGuest.passportNumber, "passportNumber", false) ||
        isDefined(jsonGuest.identificationNumber, "identificationNumber", false)
      )
    )
      isDefined(
        jsonGuest.identificationNumber,
        "identificationNumber or passportNumber"
      );
    isDefined(jsonGuest.nationality, "nationality");
    isDefined(jsonGuest.balance, "balance");
    isNumber(jsonGuest.balance, "balance");

    return new GuestBaseModel(
      jsonGuest.firstName,
      jsonGuest.lastName,
      jsonGuest.phoneNumber,
      jsonGuest.passportNumber,
      jsonGuest.identificationNumber,
      jsonGuest.nationality,
      Number(jsonGuest.balance)
    );
  }
}

export class GuestReadModel extends GuestBaseModel {
  constructor(
    public id: number,
    public firstName: string,
    public lastName: string,
    public phoneNumber: string,
    public passportNumber: string,
    public identificationNumber: string,
    public nationality: string,
    public balance: number
  ) {
    super(
      firstName,
      lastName,
      phoneNumber,
      passportNumber,
      identificationNumber,
      nationality,
      balance
    );
  }

  public static fromJson(jsonGuest: any): GuestReadModel {
    isDefined(jsonGuest.firstName, "firstName");
    isDefined(jsonGuest.lastName, "lastName");
    isDefined(jsonGuest.phoneNumber, "phoneNumber");
    if (
      !(
        isDefined(jsonGuest.passportNumber, "passportNumber", false) ||
        isDefined(jsonGuest.identificationNumber, "identificationNumber", false)
      )
    )
      isDefined(
        jsonGuest.identificationNumber,
        "identificationNumber or passportNumber"
      );
    isDefined(jsonGuest.nationality, "nationality");
    isDefined(jsonGuest.balance, "balance");
    isNumber(jsonGuest.balance, "balance");

    return new GuestReadModel(
      jsonGuest.id,
      jsonGuest.firstName,
      jsonGuest.lastName,
      jsonGuest.phoneNumber,
      jsonGuest.passportNumber,
      jsonGuest.identificationNumber,
      jsonGuest.nationality,
      Number(jsonGuest.balance)
    );
  }
}
export interface SingleGuestResponseModel {
  success: true;
  guest: GuestReadModel;
  more: any;
}
export interface ManyGuestsResponseModel {
  success: true;
  guests: GuestReadModel[];
  more: any;
}
