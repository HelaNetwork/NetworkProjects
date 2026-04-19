import type { Request, Response } from "express";
import { sendJson } from "../lib/http.js";
import { createProposal, listProposals } from "../services/proposal-service.js";

export async function createProposalController(req: Request, res: Response) {
  const result = await createProposal(req.body);
  return sendJson(res, result, 201);
}

export async function listProposalsController(req: Request, res: Response) {
  return sendJson(res, { proposals: await listProposals(String(req.params.vault)) });
}
