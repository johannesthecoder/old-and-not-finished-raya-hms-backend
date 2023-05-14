import { RoomBaseModel } from "./models";
import { BaseController } from "../../core/base_controller";

class RoomController extends BaseController {
  constructor(public tableName: string) {
    super(tableName);
  }

  async insertOne(params: { newRoom: RoomBaseModel }): Promise<number> {
    const { newRoom } = params;
    return this._insertOne({ newRow: newRoom });
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
    updatedRoom: any;
  }): Promise<number> {
    const { id, updatedRoom } = params;
    return this._updateOneById({ id: id, updatedRow: updatedRoom });
  }
  async update(params: {
    filter: string;
    updatedRoom: any;
  }): Promise<number[]> {
    const { filter, updatedRoom } = params;
    return this._update({ filter: filter, updatedRow: updatedRoom });
  }
}

export let roomController = new RoomController("rooms");
