import moment = require("moment");
import { DEFAULT_QUERY_LIMIT } from "./constants";
import * as db from "./database/database";

export abstract class BaseController {
  constructor(public tableName: string) {}

  protected async _insertOne(params: { newRow: any }): Promise<number> {
    const { newRow } = params;

    let keys: string[] = Object.keys(newRow);
    let queryString: string = `
    INSERT INTO ${this.tableName}
    (${keys.toString()})
    VALUES (${keys.map((key) =>
      typeof newRow[key] === "string"
        ? '"' + newRow[key] + '"'
        : Array.isArray(newRow[key])
        ? '"' + JSON.stringify(newRow[key]) + '"'
        : typeof newRow[key] === "object" && moment(newRow[key]).isValid()
        ? '"' + moment(newRow[key]).format() + '"'
        : typeof newRow[key] === "object"
        ? '"' + JSON.stringify(newRow[key]) + '"'
        : typeof newRow[key] === "undefined" || newRow[key] == null
        ? "NULL"
        : newRow[key]
    )})`;

    const result: any = await db.query(queryString);

    return result.insertId || 0;
  }

  protected async _getOneById(params: { id: number }) {
    const { id } = params;
    let queryString: string = `SELECT * FROM ${this.tableName} WHERE id = ${id} LIMIT 1`;

    const result: any = await db.query(queryString);

    return result.length > 0 ? result[0] : {};
  }

  protected async _getManyByIds(params: { ids: number[] }) {
    const { ids } = params;
    let queryString: string = `SELECT * FROM ${
      this.tableName
    } WHERE id IN (${ids.toString()})`;

    const result: any = await db.query(queryString);

    return result;
  }

  protected async _getOne(params: { filter: string; skip? }) {
    params.skip = !isNaN(Number(params.skip)) ? Number(params.skip) : 0;
    const { filter, skip } = params;

    let queryString: string = `SELECT * FROM ${this.tableName}`;
    queryString = filter ? queryString + ` WHERE ${filter}` : queryString;
    queryString = queryString + ` LIMIT ${skip}, 1`;

    const result: any = await db.query(queryString);

    return result.length > 0 ? result[0] : {};
  }

  protected async _getMany(params: { filter: string; limit?; skip? }) {
    params.limit = !isNaN(Number(params.limit))
      ? Number(params.limit)
      : DEFAULT_QUERY_LIMIT;
    params.skip = !isNaN(Number(params.skip)) ? Number(params.skip) : 0;
    const { filter, limit, skip } = params;

    let queryString: string = `SELECT * FROM ${this.tableName} ${
      filter ? "WHERE" + filter : ""
    } LIMIT ${skip}, ${limit}`;

    const result: any = await db.query(queryString);

    return result;
  }

  protected async _updateOneById(params: {
    id: number;
    updatedRow: any;
  }): Promise<number> {
    const { id, updatedRow } = params;
    let keys: string[] = Object.keys(updatedRow);

    let queryString: string = `UPDATE ${this.tableName} SET`;
    keys.forEach(function (key) {
      queryString += ` ${key} = `;
      queryString +=
        typeof updatedRow[key] === "string"
          ? updatedRow[key][0] === "$"
            ? updatedRow[key].slice(1, updatedRow[key].length)
            : '"' + updatedRow[key] + '"'
          : Array.isArray(updatedRow[key])
          ? "'" + JSON.stringify(updatedRow[key]) + "'"
          : typeof updatedRow[key] === "object" &&
            moment(updatedRow[key]).isValid()
          ? '"' + moment(updatedRow[key]).format() + '"'
          : typeof updatedRow[key] === "object"
          ? "'" + JSON.stringify(updatedRow[key]) + "'"
          : typeof updatedRow[key] === "undefined" || updatedRow[key] == null
          ? "NULL"
          : updatedRow[key];

      queryString += ",";
    });
    queryString = queryString.slice(0, -1);
    queryString += ` WHERE  id=${id}`;

    const result: any = await db.query(queryString);

    return result.affectedRows > 0 && result.changedRows > 0
      ? id
      : result.affectedRows
      ? -1
      : 0;
  }

  protected async _update(params: {
    filter: string;
    updatedRow: any;
  }): Promise<number[]> {
    const { filter, updatedRow } = params;
    let keys: string[] = Object.keys(updatedRow);

    let queryString: string = `UPDATE ${this.tableName} SET`;
    keys.forEach(function (key) {
      queryString += ` ${key} =`;
      queryString +=
        typeof updatedRow[key] === "string"
          ? updatedRow[key][0] === "$"
            ? updatedRow[key].slice(1, updatedRow[key].length)
            : '"' + updatedRow[key] + '"'
          : Array.isArray(updatedRow[key])
          ? "'" + JSON.stringify(updatedRow[key]) + "'"
          : typeof updatedRow[key] === "object" &&
            moment(updatedRow[key]).isValid()
          ? '"' + moment(updatedRow[key]).format() + '"'
          : typeof updatedRow[key] === "object"
          ? "'" + JSON.stringify(updatedRow[key]) + "'"
          : typeof updatedRow[key] === "undefined" || updatedRow[key] == null
          ? "NULL"
          : updatedRow[key];

      queryString += ",";
    });
    queryString = queryString.slice(0, -1);
    queryString = filter ? queryString + ` WHERE ${filter}` : queryString;

    const result: any = await db.query(queryString);

    if (result.affectedRows == 0) {
      return [];
    } else {
      const affectedRowIds: any = await db.query(
        `SELECT (id) FROM ${this.tableName} ${filter ? "WHERE " + filter : ""}`
      );
      return affectedRowIds.map((affectedRowId) => affectedRowId["id"]);
    }
  }
}
