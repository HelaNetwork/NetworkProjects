import { Router } from "express";
import {
	agentIdentityController,
	healthController,
	listAgentsDirectoryController,
	reputationController,
	vaultBalanceController,
} from "../controllers/read-controller.js";
import { getVaultSignalsController } from "../controllers/vault-signals-controller.js";
import { x402SupportedController } from "../controllers/x402-controller.js";
import { asyncHandler } from "../middleware/error-handler.js";

export const readRouter = Router();
readRouter.get("/health", asyncHandler(healthController));
readRouter.get("/agents", asyncHandler(listAgentsDirectoryController));
readRouter.get("/agent-identity/:agent", asyncHandler(agentIdentityController));
readRouter.get("/reputation/:agent", asyncHandler(reputationController));
readRouter.get("/vault-balance/:vault", asyncHandler(vaultBalanceController));
readRouter.get("/vault-signals", asyncHandler(getVaultSignalsController));
readRouter.get("/x402/supported", asyncHandler(x402SupportedController));
