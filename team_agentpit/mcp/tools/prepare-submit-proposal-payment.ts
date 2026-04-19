import * as z from "zod/v4";
import { decodePaymentRequiredHeader } from "@x402/core/http";
import type { ToolRequest } from "../../shared/types.js";

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

export const prepareSubmitProposalPaymentTool = {
  name: "prepare_submit_proposal_payment",
  description:
    "Create a payment challenge for submit_proposal. Returns x402 payment-required details to be signed by your wallet.",
  inputSchema: proposalSchema.shape,
  async handler({ args }: ToolRequest) {
    const proposal = proposalSchema.parse(args);
    const response = await fetch(`${process.env.BACKEND_URL ?? "http://localhost:3001"}/proposals`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(proposal),
    });

    const paymentRequiredHeader = response.headers.get("PAYMENT-REQUIRED") ?? response.headers.get("X-PAYMENT");

    if (response.status !== 402) {
      const bodyText = await response.text();
      if (response.ok) {
        return {
          paid: true,
          status: response.status,
          result: bodyText ? JSON.parse(bodyText) : null,
          note: "Proposal accepted without a payment challenge.",
        };
      }

      throw new Error(formatHttpError("prepare_submit_proposal_payment", response.status, response, bodyText));
    }

    if (!paymentRequiredHeader) {
      throw new Error("402 received but PAYMENT-REQUIRED header is missing.");
    }

    return {
      paid: false,
      status: 402,
      paymentRequiredHeader,
      paymentRequired: decodePaymentRequiredHeader(paymentRequiredHeader),
      hint: "Sign this challenge with your wallet, then call build_payment_payload_from_signature with the full wallet-produced exact EVM payload. Keep payload.authorization.from for EIP-3009 or payload.permit2Authorization.from for Permit2, then submit_proposal_with_payment_signature.",
      proposal,
    };
  },
};

function formatHttpError(
  action: string,
  status: number,
  response: Response,
  bodyText: string,
) {
  const normalized = bodyText.trim();
  const paymentRequiredHeader =
    response.headers.get("PAYMENT-REQUIRED") ?? response.headers.get("X-PAYMENT") ?? null;
  const paymentResponseHeader =
    response.headers.get("PAYMENT-RESPONSE") ?? response.headers.get("X-PAYMENT-RESPONSE") ?? null;

  let parsed: unknown;
  if (normalized) {
    try {
      parsed = JSON.parse(normalized);
    } catch {
      parsed = normalized;
    }
  }

  const parsedIsEmptyObject =
    typeof parsed === "object" && parsed !== null && !Array.isArray(parsed) && Object.keys(parsed).length === 0;

  const reason =
    !normalized || parsedIsEmptyObject
      ? "Backend returned an empty/unhelpful body."
      : typeof parsed === "string"
        ? parsed
        : JSON.stringify(parsed);

  return [
    `${action} failed with status ${status}.`,
    reason,
    `paymentRequiredHeader=${paymentRequiredHeader ?? "absent"}`,
    `paymentResponseHeader=${paymentResponseHeader ?? "absent"}`,
  ].join(" ");
}
