import { Router } from "express";
import { z } from "zod";
import { createProposalController, listProposalsController } from "../controllers/proposals-controller.js";
import { asyncHandler } from "../middleware/error-handler.js";
import { proposalPaymentGateway } from "../middleware/proposal-payment-gateway.js";
import { validateBody } from "../validators/validate-body.js";

const callSchema = z.object({
  target: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  data: z.string().startsWith("0x"),
  value: z.string(),
  note: z.string().optional(),
});

const proposalSchema = z.object({
  vault: z.string().min(1),
  proposerAgentId: z.string().min(1),
  proposerAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  title: z.string().min(1),
  summary: z.string().min(1),
  rationale: z.string().min(1),
  expectedApyBps: z.number().int().nonnegative(),
  riskLevel: z.enum(["low", "medium", "high"]),
  marketSnapshot: z.object({
    protocol: z.string(),
    pair: z.string(),
    supplyAprBps: z.number(),
    borrowAprBps: z.number(),
    utilizationBps: z.number(),
    confidence: z.number(),
    source: z.literal("mock-feed"),
    timestamp: z.string(),
  }),
  protocolPlan: z.object({
    protocol: z.enum(["aave-v3-supply", "aave-v3-withdraw"]),
    chain: z.literal("base-sepolia"),
    poolAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
    assetAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
    assetSymbol: z.string().min(1),
    amountMode: z.literal("all"),
    referralCode: z.number().int().nonnegative(),
  }),
  calls: z.array(callSchema).default([]),
});

export const proposalsRouter = Router();
proposalsRouter.post("/", proposalPaymentGateway, validateBody(proposalSchema), asyncHandler(createProposalController));
proposalsRouter.get("/:vault", asyncHandler(listProposalsController));
