import { GuestBaseModel } from "./models";
import { BaseController } from "../../core/base_controller";

class GuestController extends BaseController {
  constructor(public tableName: string) {
    super(tableName);
  }

  async insertOne(params: { newGuest: GuestBaseModel }): Promise<number> {
    const { newGuest } = params;
    return this._insertOne({ newRow: newGuest });
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
    updatedGuest: any;
  }): Promise<number> {
    const { id, updatedGuest } = params;
    return this._updateOneById({ id: id, updatedRow: updatedGuest });
  }
  async update(params: {
    filter: string;
    updatedGuest: any;
  }): Promise<number[]> {
    const { filter, updatedGuest } = params;
    return this._update({ filter: filter, updatedRow: updatedGuest });
  }
  async updateBalance(params: { id: number; amount: number }): Promise<number> {
    const { id, amount } = params;
    return this._updateOneById({
      id: id,
      updatedRow: { balance: `$guests.balance + ${amount}` },
    });
  }
}

export let guestController = new GuestController("guests");
