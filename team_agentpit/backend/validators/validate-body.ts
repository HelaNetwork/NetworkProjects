import type { NextFunction, Request, Response } from "express";
import type { ZodTypeAny } from "zod";
import { sendJson } from "../lib/http.js";

export function validateBody(schema: ZodTypeAny) {
  return (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return sendJson(res, { error: parsed.error.flatten() }, 400);
    }

    req.body = parsed.data;
    next();
  };
}
