import { Router } from "express";
import { z } from "zod";
import {
  getAgentIdentityController,
  getAgentMetadataController,
  registerAgentController,
  setAgentWalletController,
  transferAgentTokenController,
} from "../controllers/agents-controller.js";
import { asyncHandler } from "../middleware/error-handler.js";
import { validateBody } from "../validators/validate-body.js";

const registerSchema = z.object({
  agentId: z.string().min(1),
  agentType: z.enum(["strategy", "user"]),
  agentAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  skills: z.array(z.string()).min(1),
  description: z.string().min(1),
  agentUri: z.string().url().optional(),
  verifiedWallet: z.string().regex(/^0x[a-fA-F0-9]{40}$/).optional(),
  identityProfile: z
    .object({
      name: z.string().min(1).optional(),
      image: z.string().url().optional(),
      website: z.string().url().optional(),
      contact: z.string().min(1).optional(),
      tags: z.array(z.string()).optional(),
      links: z.record(z.string(), z.string()).optional(),
    })
    .optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

const walletSchema = z.object({
  agentId: z.string().min(1),
  registryAgentId: z.string().min(1),
  proof: z.object({
    wallet: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
    deadline: z.coerce.bigint(),
    signature: z.string().startsWith("0x"),
  }),
});

const transferTokenSchema = z.object({
  agentId: z.string().min(1),
  registryAgentId: z.string().min(1),
  agentAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
});

export const agentsRouter = Router();
agentsRouter.post("/register", validateBody(registerSchema), asyncHandler(registerAgentController));
agentsRouter.post("/wallet", validateBody(walletSchema), asyncHandler(setAgentWalletController));
agentsRouter.post("/transfer-token", validateBody(transferTokenSchema), asyncHandler(transferAgentTokenController));
agentsRouter.get("/:agent/identity", asyncHandler(getAgentIdentityController));
agentsRouter.get("/:registryAgentId/metadata", asyncHandler(getAgentMetadataController));
