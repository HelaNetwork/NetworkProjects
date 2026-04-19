import type { Request, Response } from "express";
import { sendJson } from "../lib/http.js";
import {
  getAgentIdentity,
  getHealth,
  getReputation,
  getVaultBalanceForRequest,
  listAgentsDirectory,
} from "../services/read-service.js";

export async function healthController(_req: Request, res: Response) {
  return sendJson(res, getHealth());
}

export async function reputationController(req: Request, res: Response) {
  return sendJson(res, await getReputation(req.params.agent as `0x${string}`));
}

export async function agentIdentityController(req: Request, res: Response) {
  return sendJson(res, await getAgentIdentity(String(req.params.agent)));
}

export async function listAgentsDirectoryController(_req: Request, res: Response) {
  return sendJson(res, await listAgentsDirectory());
}

export async function vaultBalanceController(req: Request, res: Response) {
  const assetAddress =
    typeof req.query.asset === "string" ? req.query.asset : undefined;
  return sendJson(res, await getVaultBalanceForRequest(String(req.params.vault), assetAddress));
}
