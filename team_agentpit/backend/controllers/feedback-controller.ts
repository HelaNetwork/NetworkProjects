import type { Request, Response } from "express";
import { sendJson } from "../lib/http.js";
import { giveFeedbackService, readAllFeedbackService } from "../services/feedback-service.js";
import { getFeedbackSummaryForAgent } from "../services/read-service.js";

export async function giveFeedbackController(req: Request, res: Response) {
  const result = await giveFeedbackService(req.body);
  return sendJson(res, result, 201);
}

export async function feedbackSummaryController(req: Request, res: Response) {
  const result = await getFeedbackSummaryForAgent(String(req.params.registryAgentId));
  return sendJson(res, result);
}

export async function readAllFeedbackController(req: Request, res: Response) {
  const result = await readAllFeedbackService(String(req.params.registryAgentId));
  return sendJson(res, { feedback: result });
}
