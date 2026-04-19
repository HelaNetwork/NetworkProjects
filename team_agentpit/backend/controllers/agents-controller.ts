import type { Request, Response } from "express";
import { sendJson } from "../lib/http.js";
import {
  registerAgent,
  setAgentWalletService,
  transferAgentTokenService,
} from "../services/agent-service.js";
import { getAgentIdentity, getAgentMetadataByKey } from "../services/read-service.js";

export async function registerAgentController(req: Request, res: Response) {
  const result = await registerAgent(req.body);
  return sendJson(res, result, 201);
}

export async function getAgentMetadataController(req: Request, res: Response) {
  const key = typeof req.query.key === "string" ? req.query.key : undefined;
  const result = await getAgentMetadataByKey(String(req.params.registryAgentId), key);
  return sendJson(res, result);
}

export async function getAgentIdentityController(req: Request, res: Response) {
  const result = await getAgentIdentity(String(req.params.agent));
  return sendJson(res, result);
}

export async function setAgentWalletController(req: Request, res: Response) {
  const result = await setAgentWalletService(req.body);
  return sendJson(res, result);
}

export async function transferAgentTokenController(req: Request, res: Response) {
  const result = await transferAgentTokenService(req.body);
  return sendJson(res, result);
}
