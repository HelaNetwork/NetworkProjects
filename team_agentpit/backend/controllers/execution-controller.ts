import type { Request, Response } from "express";
import { sendJson } from "../lib/http.js";
import { executeProposal } from "../services/execution-service.js";

export async function executeProposalController(req: Request, res: Response) {
  return sendJson(res, await executeProposal(req.body), 201);
}
