import { EmployeeBaseModel } from "./models";
import { BaseController } from "../../core/base_controller";

class EmployeeController extends BaseController {
  constructor(public tableName: string) {
    super(tableName);
  }

  async insertOne(params: { newEmployee: EmployeeBaseModel }): Promise<number> {
    const { newEmployee } = params;
    return this._insertOne({ newRow: newEmployee });
  }

  async getOneById(params: { id: number }) {
    const { id } = params;
    return this._getOneById({ id: id });
  }

  async getManyByIds(params: { ids: number[] }) {
    const { ids } = params;
    return this._getManyByIds({ ids: ids });
  }

  async getOne(params: { filter: string; skip? }) {
    const { filter, skip } = params;
    return this._getOne({ filter: filter, skip: skip });
  }
  async getMany(params: { filter: string; skip?; limit? }) {
    const { filter, skip, limit } = params;
    return this._getMany({ filter: filter, skip: skip, limit: limit });
  }
  async updateOneById(params: {
    id: number;
    updatedEmployee: any;
  }): Promise<number> {
    const { id, updatedEmployee } = params;
    return this._updateOneById({ id: id, updatedRow: updatedEmployee });
  }
  async update(params: {
    filter: string;
    updatedEmployee: any;
  }): Promise<number[]> {
    const { filter, updatedEmployee } = params;
    return this._update({ filter: filter, updatedRow: updatedEmployee });
  }
}

export let employeeController = new EmployeeController("employees");
