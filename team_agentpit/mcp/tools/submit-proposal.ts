import * as z from "zod/v4";
import type { ToolRequest } from "../../shared/types.js";

const schema = z.object({
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
  calls: z
    .array(
      z.object({
        target: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
        data: z.string().startsWith("0x"),
        value: z.string(),
        note: z.string().optional(),
      }),
    )
    .default([]),
});

export const submitProposalTool = {
  name: "submit_proposal",
  description: "Submit a DeFi strategy proposal into the backend orderbook.",
  inputSchema: schema.shape,
  async handler({ args }: ToolRequest) {
    const response = await fetch(`${process.env.BACKEND_URL ?? "http://localhost:3001"}/proposals`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(schema.parse(args)),
    });

    if (response.status === 402) {
      throw new Error(
        "Proposal submission is paywalled by x402. Use prepare_submit_proposal_payment to fetch the challenge, sign it with your wallet, then call submit_proposal_with_payment_signature.",
      );
    }

    if (!response.ok) {
      const bodyText = await response.text();
      throw new Error(formatHttpError("submit_proposal", response.status, response, bodyText));
    }

    return response.json();
  },
};

function formatHttpError(
  action: string,
  status: number,
  response: Response,
  bodyText: string,
) {
  const normalized = bodyText.trim();
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

  const paymentRequiredHeader =
    response.headers.get("PAYMENT-REQUIRED") ?? response.headers.get("X-PAYMENT") ?? null;

  return [
    `${action} failed with status ${status}.`,
    reason,
    `paymentRequiredHeader=${paymentRequiredHeader ?? "absent"}`,
  ].join(" ");
}
