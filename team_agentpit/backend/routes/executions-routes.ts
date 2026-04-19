import { Router } from "express";
import { z } from "zod";
import { executeProposalController } from "../controllers/execution-controller.js";
import { asyncHandler } from "../middleware/error-handler.js";
import { validateBody } from "../validators/validate-body.js";

const executionSchema = z.object({
  vault: z.string().min(1),
  proposalId: z.string().min(1),
  userAgentId: z.string().min(1),
  approval: z.object({
    vault: z.string(),
    proposalId: z.string(),
    signer: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
    nonce: z.coerce.bigint(),
    deadline: z.coerce.bigint(),
    signature: z.string().startsWith("0x"),
  }),
});

export const executionsRouter = Router();
executionsRouter.post("/", validateBody(executionSchema), asyncHandler(executeProposalController));
