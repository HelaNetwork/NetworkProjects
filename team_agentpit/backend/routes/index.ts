import { Router } from "express";
import { agentsRouter } from "./agents-routes.js";
import { executionsRouter } from "./executions-routes.js";
import { feedbackRouter } from "./feedback-routes.js";
import { proposalsRouter } from "./proposals-routes.js";
import { readRouter } from "./read-routes.js";
import { vaultSignalsRouter } from "./vault-signals-routes.js";


export const apiRouter = Router();


apiRouter.use("/agents", agentsRouter);
apiRouter.use("/proposals", proposalsRouter);
apiRouter.use("/feedback", feedbackRouter);
apiRouter.use("/execute", executionsRouter);
apiRouter.use("/vault-signals", vaultSignalsRouter);
apiRouter.use("/", readRouter);
