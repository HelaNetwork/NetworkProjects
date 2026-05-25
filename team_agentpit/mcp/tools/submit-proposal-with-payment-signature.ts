import * as z from "zod/v4";
import { encodePaymentSignatureHeader } from "@x402/core/http";
import type { PaymentPayload } from "@x402/core/types";
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

const schema = z.object({
  proposal: proposalSchema,
  paymentSignatureHeader: z.string().min(1).optional(),
  paymentPayload: z
    .object({
      x402Version: z.number().int().positive(),
      resource: z.any().optional(),
      accepted: z.object({
        scheme: z.string().min(1),
        network: z.string().min(1),
        asset: z.string().min(1),
        amount: z.string().min(1),
        payTo: z.string().min(1),
        maxTimeoutSeconds: z.number().int().positive(),
        extra: z.record(z.string(), z.unknown()).default({}),
      }),
      payload: z.record(z.string(), z.unknown()),
      extensions: z.record(z.string(), z.unknown()).optional(),
    })
    .optional(),
  signatureHeaderName: z.enum(["PAYMENT-SIGNATURE", "X-PAYMENT"]).default("PAYMENT-SIGNATURE"),
}).refine((value) => Boolean(value.paymentSignatureHeader || value.paymentPayload), {
  message: "Provide either paymentSignatureHeader or paymentPayload.",
  path: ["paymentSignatureHeader"],
});

export const submitProposalWithPaymentSignatureTool = {
  name: "submit_proposal_with_payment_signature",
  description:
    "Submit a proposal using a pre-signed x402 payment signature header from your wallet signer.",
  inputSchema: schema.shape,
  async handler({ args }: ToolRequest) {
    const input = schema.parse(args);
    const paymentSignatureHeader =
      input.paymentSignatureHeader ?? encodePaymentSignatureHeader(input.paymentPayload as PaymentPayload);

    const response = await fetch(`${process.env.BACKEND_URL ?? "http://localhost:3001"}/proposals`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "PAYMENT-SIGNATURE": paymentSignatureHeader,
        "X-PAYMENT": paymentSignatureHeader,
        [input.signatureHeaderName]: paymentSignatureHeader,
      },
      body: JSON.stringify(input.proposal),
    });

    const text = await response.text();
    if (!response.ok) {
      throw new Error(formatHttpError("submit_proposal_with_payment_signature", response.status, response, text));
    }

    return text ? JSON.parse(text) : null;
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
