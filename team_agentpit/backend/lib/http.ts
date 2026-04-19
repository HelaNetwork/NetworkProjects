import type { Response } from "express";

export function sendJson(res: Response, payload: unknown, status = 200) {
  return res.status(status).type("application/json").send(JSON.stringify(payload, jsonReplacer));
}

export function jsonReplacer(_key: string, value: unknown) {
  return typeof value === "bigint" ? value.toString() : value;
}
