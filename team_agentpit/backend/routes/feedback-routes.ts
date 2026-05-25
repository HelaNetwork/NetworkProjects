import { Router } from "express";
import { z } from "zod";
import {
  feedbackSummaryController,
  giveFeedbackController,
  readAllFeedbackController,
} from "../controllers/feedback-controller.js";
import { asyncHandler } from "../middleware/error-handler.js";
import { validateBody } from "../validators/validate-body.js";

const feedbackSchema = z.object({
  registryAgentId: z.string().min(1),
  score: z.number().int().min(0).max(100),
  category: z.enum(["strategy", "execution", "trust", "general"]),
  comment: z.string().optional(),
});

export const feedbackRouter = Router();
feedbackRouter.post("/", validateBody(feedbackSchema), asyncHandler(giveFeedbackController));
feedbackRouter.get("/:registryAgentId/summary", asyncHandler(feedbackSummaryController));
feedbackRouter.get("/:registryAgentId/all", asyncHandler(readAllFeedbackController));
