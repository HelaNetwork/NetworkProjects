import { Router } from "express";
import { z } from "zod";
import { getVaultSignalsController, publishVaultSignalController } from "../controllers/vault-signals-controller.js";
import { asyncHandler } from "../middleware/error-handler.js";
import { validateBody } from "../validators/validate-body.js";

const publishSchema = z.object({
  ownerAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  vaultAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  assetAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  assetSymbol: z.string().min(1),
  fundedAmount: z.string().min(1),
  status: z.enum(["vault-created", "vault-funded", "ready-for-strategy"]),
  userAgentId: z.string().min(1),
  chain: z.literal("base-sepolia"),
  notes: z.string().optional(),
});

export const vaultSignalsRouter = Router();
vaultSignalsRouter.post("/", validateBody(publishSchema), asyncHandler(publishVaultSignalController));
vaultSignalsRouter.get("/", asyncHandler(getVaultSignalsController));
