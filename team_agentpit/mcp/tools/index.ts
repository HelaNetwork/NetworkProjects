import * as z from "zod/v4";
import { getAgentIdentityTool } from "./get-agent-identity.js";
import { getAgentMetadataTool } from "./get-agent-metadata.js";
import { getFeedbackSummaryTool } from "./get-feedback-summary.js";
import { getProposalsTool } from "./get-proposals.js";
import { getReputationTool } from "./get-reputation.js";
import { getVaultBalanceTool } from "./get-vault-balance.js";
import { getX402SupportedTool } from "./get-x402-supported.js";
import { getVaultSignalsTool } from "./get-vault-signals.js";
import { giveFeedbackTool } from "./give-feedback.js";
import { publishVaultSignalTool } from "./publish-vault-signal.js";
import { readAllFeedbackTool } from "./read-all-feedback.js";
import { registerAgentTool } from "./register-agent.js";
import { setAgentWalletTool } from "./set-agent-wallet.js";
import { prepareSubmitProposalPaymentTool } from "./prepare-submit-proposal-payment.js";
import { submitExecutionTool } from "./submit-execution.js";
import { submitProposalTool } from "./submit-proposal.js";
import { submitProposalWithPaymentSignatureTool } from "./submit-proposal-with-payment-signature.js";
import { transferAgentTokenTool } from "./transfer-agent-token.js";
import { buildPaymentPayloadFromSignatureTool } from "./build-payment-payload-from-signature.js";
import type { ToolRequest } from "../../shared/types.js";

export interface ToolModule {
  name: string;
  description: string;
  inputSchema: Record<string, z.ZodType>;
  handler: (request: ToolRequest) => Promise<unknown>;
}

export const toolRegistry: ToolModule[] = [
  registerAgentTool,
  transferAgentTokenTool,
  getAgentIdentityTool,
  getAgentMetadataTool,
  setAgentWalletTool,
  getReputationTool,
  giveFeedbackTool,
  getFeedbackSummaryTool,
  readAllFeedbackTool,
  publishVaultSignalTool,
  getVaultSignalsTool,
  getX402SupportedTool,
  prepareSubmitProposalPaymentTool,
  buildPaymentPayloadFromSignatureTool,
  submitProposalTool,
  submitProposalWithPaymentSignatureTool,
  getProposalsTool,
  submitExecutionTool,
  getVaultBalanceTool,
];

export const toolMap = new Map(toolRegistry.map((tool) => [tool.name, tool]));
