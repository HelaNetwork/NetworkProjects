import type { FeedbackRecord } from "../../shared/types.js";
import { getBroker } from "../lib/broker-registry.js";
import { getMarketplaceRepository } from "../repositories/index.js";
import { submitFeedback } from "./contracts-service.js";
import { getAllFeedbackForAgent, getFeedbackSummaryForAgent } from "./read-service.js";

export async function giveFeedbackService(input: {
  registryAgentId: string;
  score: number;
  category: FeedbackRecord["category"];
  comment?: string;
}) {
  const onchain = await submitFeedback(input);
  const record: FeedbackRecord = {
    registryAgentId: input.registryAgentId,
    score: input.score,
    category: input.category,
    comment: input.comment,
    txHash: onchain.txHash,
    createdAt: new Date().toISOString(),
    source: onchain.status === "simulated" ? "mock" : "onchain",
  };

  await getMarketplaceRepository().saveFeedback(record);
  const summary = await getFeedbackSummaryForAgent(input.registryAgentId);
  await getMarketplaceRepository().saveFeedbackSummary(summary);
  getBroker()?.broadcast("agent.feedback_created", { record, summary, onchain });

  return {
    feedback: record,
    summary,
    onchain,
  };
}

export async function readAllFeedbackService(registryAgentId: string) {
  const onchainFeedback = await getAllFeedbackForAgent(registryAgentId);
  if (onchainFeedback.length > 0) {
    return onchainFeedback;
  }

  return getMarketplaceRepository().listFeedback(registryAgentId);
}
