import { isDefined, isValidEmployeePosition } from "../../core/checker";
import { HTTPStatusCodes, EmployeePosition } from "../../core/constants";
import { ErrorResponseModel } from "../../core/shared_models";

export class EmployeeBaseModel {
  constructor(
    public firstName: string,
    public lastName: string,
    public phoneNumber: string,
    public password: string,
    public position: EmployeePosition
  ) {}

  public static fromJson(jsonEmployee: any): EmployeeBaseModel {
    isDefined(jsonEmployee.firstName, "firstName");
    isDefined(jsonEmployee.lastName, "lastName");
    isDefined(jsonEmployee.phoneNumber, "phoneNumber");
    isDefined(jsonEmployee.password, "password");
    isDefined(jsonEmployee.position, "position");
    isValidEmployeePosition(jsonEmployee.position, "position");

    return new EmployeeBaseModel(
      String(jsonEmployee.firstName).toLocaleLowerCase(),
      String(jsonEmployee.lastName).toLocaleLowerCase(),
      String(jsonEmployee.phoneNumber).toLocaleLowerCase(),
      jsonEmployee.password,
      jsonEmployee.position
    );
  }
}

export class EmployeeReadModel extends EmployeeBaseModel {
  constructor(
    public id: number,
    public firstName: string,
    public lastName: string,
    public phoneNumber: string,
    public password: string,
    public position: EmployeePosition
  ) {
    super(firstName, lastName, phoneNumber, password, position);
  }

  public static fromJson(jsonEmployee: any): EmployeeReadModel {
    isDefined(jsonEmployee.firstName, "firstName");
    isDefined(jsonEmployee.lastName, "lastName");
    isDefined(jsonEmployee.phoneNumber, "phoneNumber");
    isDefined(jsonEmployee.password, "password");
    isDefined(jsonEmployee.position, "position");
    isValidEmployeePosition(jsonEmployee.position, "position");

    return new EmployeeReadModel(
      Number(jsonEmployee.id),
      String(jsonEmployee.firstName).toLocaleLowerCase(),
      String(jsonEmployee.lastName).toLocaleLowerCase(),
      String(jsonEmployee.phoneNumber).toLocaleLowerCase(),
      jsonEmployee.password,
      jsonEmployee.position
    );
  }
}

export class EmployeeUpdateModel {
  constructor(
    public firstName?: string,
    public lastName?: string,
    public phoneNumber?: string,
    public password?: string,
    public position?: EmployeePosition
  ) {}

  public static fromJson(jsonEmployee: any): EmployeeUpdateModel {
    isDefined(jsonEmployee.position, "position") &&
      isValidEmployeePosition(jsonEmployee.position, "position");

    let employeeUpdate: EmployeeUpdateModel = new EmployeeUpdateModel();

    employeeUpdate.firstName = isDefined(
      jsonEmployee.firstName,
      "firstName",
      false
    )
      ? String(jsonEmployee.firstName).toLocaleLowerCase()
      : undefined;
    employeeUpdate.lastName = isDefined(
      jsonEmployee.lastName,
      "lastName",
      false
    )
      ? String(jsonEmployee.lastName).toLocaleLowerCase()
      : undefined;
    employeeUpdate.phoneNumber = isDefined(
      jsonEmployee.phoneNumber,
      "phoneNumber",
      false
    )
      ? String(jsonEmployee.phoneNumber).toLocaleLowerCase()
      : undefined;
    employeeUpdate.password = isDefined(
      jsonEmployee.password,
      "password",
      false
    )
      ? jsonEmployee.password
      : undefined;
    employeeUpdate.position = isDefined(
      jsonEmployee.position,
      "position",
      false
    )
      ? jsonEmployee.position
      : undefined;

    if (
      employeeUpdate.firstName ||
      employeeUpdate.lastName ||
      employeeUpdate.phoneNumber ||
      employeeUpdate.password ||
      employeeUpdate.position
    ) {
      return employeeUpdate;
    } else {
      throw {
        success: false,
        type: "MISSING_DATA",
        title: "no updated employee data",
        message:
          "no updated employee data was given while trying to perform update operation.",
        statusCode: HTTPStatusCodes.BAD_REQUEST,
      } as ErrorResponseModel;
    }
  }

  public removeUndefined() {
    let onlyDefinedUpdate = {};

    if (isDefined(this.firstName, "firstName", false))
      onlyDefinedUpdate["firstName"] = this.firstName;
    if (isDefined(this.lastName, "lastName", false))
      onlyDefinedUpdate["lastName"] = this.lastName;
    if (isDefined(this.phoneNumber, "phoneNumber", false))
      onlyDefinedUpdate["phoneNumber"] = this.phoneNumber;
    if (isDefined(this.password, "password", false))
      onlyDefinedUpdate["password"] = this.password;
    if (
      isDefined(this.position, "position", false) &&
      isValidEmployeePosition(this.position, "position", false)
    )
      onlyDefinedUpdate["position"] = this.position;

    return onlyDefinedUpdate;
  }
}

export interface SingleEmployeeResponseModel {
  success: true;
  employee: EmployeeReadModel;
  more: any;
}

export interface ManyEmployeesResponseModel {
  success: true;
  employees: EmployeeReadModel[];
  more: any;
}
