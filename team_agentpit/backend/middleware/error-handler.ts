import type { NextFunction, Request, Response } from "express";
import { sendJson } from "../lib/http.js";


export function asyncHandler<T extends Request, U extends Response>(
  handler: (req: T, res: U, next: NextFunction) => Promise<unknown>,
) {
  return (req: T, res: U, next: NextFunction) => {
    handler(req, res, next).catch(next);
  };
}

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  const message = error instanceof Error ? error.message : String(error);
  return sendJson(res, { error: message }, 500);
}
