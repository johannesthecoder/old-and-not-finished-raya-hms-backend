import mysql = require("mysql2/promise");
import { config } from "./config";

export async function query(sql, params?) {
  const connection = await mysql.createConnection(config.db);

  const [results] = await connection.execute(sql, params);

  return results;
}

export function getOffset(currentPage: number = 1, listPerPage: number) {
  return (currentPage - 1) * listPerPage;
}

export function emptyOrRows(rows) {
  if (!rows) {
    return [];
  }
  return rows;
}

export function generateUniqueId(): string {
  return `${(<any>new Date().getTime()) as string}${Math.floor(
    Math.random() * 1000
  )}`;
}
