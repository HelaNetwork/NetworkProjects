import type { Request, Response } from "express";
import { sendJson } from "../lib/http.js";
import { getVaultSignals, publishVaultSignal } from "../services/vault-signal-service.js";

export async function publishVaultSignalController(req: Request, res: Response) {
  return sendJson(res, await publishVaultSignal(req.body), 201);
}

export async function getVaultSignalsController(req: Request, res: Response) {
  const ownerAddress = typeof req.query.ownerAddress === "string" ? req.query.ownerAddress : undefined;
  const vaultAddress = typeof req.query.vaultAddress === "string" ? req.query.vaultAddress : undefined;
  return sendJson(res, await getVaultSignals({ ownerAddress, vaultAddress }));
}
