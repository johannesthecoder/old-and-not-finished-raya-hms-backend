import { isDefined, isValidEmployeePosition } from "../../core/checker";
import { EmployeePosition } from "../../core/constants";

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
