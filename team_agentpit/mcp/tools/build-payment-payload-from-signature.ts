import * as z from "zod/v4";
import { decodePaymentRequiredHeader, encodePaymentSignatureHeader } from "@x402/core/http";
import type { PaymentPayload, PaymentRequired, PaymentRequirements } from "@x402/core/types";
import type { ToolRequest } from "../../shared/types.js";

const paymentRequirementsSchema = z.object({
  scheme: z.string().min(1),
  network: z.string().min(1),
  asset: z.string().min(1),
  amount: z.string().min(1),
  payTo: z.string().min(1),
  maxTimeoutSeconds: z.number().int().nonnegative(),
  extra: z.record(z.string(), z.unknown()).default({}),
});

const paymentPayloadSchema = z.object({
  x402Version: z.number().int().positive(),
  resource: z.any().optional(),
  accepted: paymentRequirementsSchema,
  payload: z.record(z.string(), z.unknown()),
  extensions: z.record(z.string(), z.unknown()).optional(),
});

const paymentPayloadBaseSchema = z.object({
  x402Version: z.number().int().positive(),
  resource: z.any().optional(),
  accepted: paymentRequirementsSchema,
  payload: z.record(z.string(), z.unknown()),
  extensions: z.record(z.string(), z.unknown()).optional(),
});

const schema = z.object({
  paymentRequiredHeader: z.string().min(1).optional(),
  paymentRequired: z.any().optional(),
  paymentPayload: paymentPayloadSchema.optional(),
  paymentPayloadBase: paymentPayloadBaseSchema.optional(),
  signature: z.string().min(1).optional(),
}).refine((value) => Boolean(value.paymentRequiredHeader || value.paymentRequired), {
  message: "Provide paymentRequiredHeader or paymentRequired.",
  path: ["paymentRequiredHeader"],
}).refine((value) => Boolean(value.paymentPayload || (value.paymentPayloadBase && value.signature)), {
  message: "Provide paymentPayload or paymentPayloadBase with signature.",
  path: ["paymentPayload"],
});

export const buildPaymentPayloadFromSignatureTool = {
  name: "build_payment_payload_from_signature",
  description:
    "Validate that a wallet-produced paymentPayload matches the paymentRequired challenge, or merge a raw signature into a payload template, then return the encoded x402 header to submit.",
  inputSchema: schema.shape,
  async handler({ args }: ToolRequest) {
    const input = schema.parse(args);
    const paymentRequired = normalizePaymentRequired(input.paymentRequiredHeader, input.paymentRequired);
    const paymentPayload = input.paymentPayload
      ? (paymentPayloadSchema.parse(input.paymentPayload) as PaymentPayload)
      : buildPaymentPayloadFromBase(
          paymentPayloadBaseSchema.parse(input.paymentPayloadBase),
          input.signature as string,
        );

    validateExactEvmPayloadShape(paymentPayload);
    const matchedRequirement = findMatchingRequirement(paymentRequired, paymentPayload.accepted);

    if (!matchedRequirement) {
      throw new Error(
        [
          "No matching payment requirements.",
          `accepted.scheme=${paymentPayload.accepted.scheme}`,
          `accepted.network=${paymentPayload.accepted.network}`,
          `accepted.payTo=${paymentPayload.accepted.payTo}`,
          `accepted.amount=${paymentPayload.accepted.amount}`,
          `available=${paymentRequired.accepts
            .map((accept) => `${accept.scheme}:${accept.network}:${accept.payTo}:${accept.amount}`)
            .join(" | ")}`,
        ].join(" "),
      );
    }

    paymentPayload.accepted = matchedRequirement;

    const paymentSignatureHeader = encodePaymentSignatureHeader(paymentPayload);

    return {
      ok: true,
      paymentRequired,
      matchedRequirement,
      paymentPayload,
      paymentSignatureHeader,
    };
  },
};

function normalizePaymentRequired(paymentRequiredHeader?: string, paymentRequired?: unknown): PaymentRequired {
  if (paymentRequiredHeader) {
    return decodePaymentRequiredHeader(paymentRequiredHeader);
  }

  const candidate = paymentRequired as PaymentRequired | undefined;
  if (!candidate || !Array.isArray(candidate.accepts) || candidate.accepts.length === 0) {
    throw new Error("Invalid paymentRequired: accepts[] is required.");
  }

  return candidate;
}

function buildPaymentPayloadFromBase(
  paymentPayloadBase: z.infer<typeof paymentPayloadBaseSchema>,
  signature: string,
): PaymentPayload {
  return {
    ...paymentPayloadBase,
    payload: {
      ...paymentPayloadBase.payload,
      signature,
    },
  } as PaymentPayload;
}

function validateExactEvmPayloadShape(paymentPayload: PaymentPayload) {
  if (paymentPayload.accepted.scheme !== "exact") {
    return;
  }

  const rawPayload = paymentPayload.payload as Record<string, unknown>;
  if (typeof rawPayload.signature !== "string" || !rawPayload.signature.startsWith("0x")) {
    throw new Error("Invalid exact EVM payment payload: payload.signature must be a 0x-prefixed hex string.");
  }

  const hasAuthorization = typeof rawPayload.authorization === "object" && rawPayload.authorization !== null;
  const hasPermit2Authorization =
    typeof rawPayload.permit2Authorization === "object" && rawPayload.permit2Authorization !== null;

  if (!hasAuthorization && !hasPermit2Authorization) {
    throw new Error(
      [
        "Invalid exact EVM payment payload.",
        "The payload must include either payload.authorization.from for EIP-3009 or payload.permit2Authorization.from for Permit2.",
        "A raw signature alone is not enough; the full authorization object must be preserved from the wallet-produced payload.",
      ].join(" "),
    );
  }

  if (hasAuthorization) {
    const authorization = rawPayload.authorization as Record<string, unknown>;
    if (typeof authorization.from !== "string") {
      throw new Error("Invalid exact EVM payment payload: payload.authorization.from is required.");
    }
  }

  if (hasPermit2Authorization) {
    const permit2Authorization = rawPayload.permit2Authorization as Record<string, unknown>;
    if (typeof permit2Authorization.from !== "string") {
      throw new Error("Invalid exact EVM payment payload: payload.permit2Authorization.from is required.");
    }
  }
}

function findMatchingRequirement(
  paymentRequired: PaymentRequired,
  accepted: PaymentRequirements,
) {
  return paymentRequired.accepts.find((requirement) =>
    requirement.scheme === accepted.scheme &&
    requirement.network === accepted.network &&
    requirement.asset === accepted.asset &&
    requirement.amount === accepted.amount &&
    requirement.payTo === accepted.payTo &&
    requirement.maxTimeoutSeconds === accepted.maxTimeoutSeconds &&
    JSON.stringify(requirement.extra ?? {}) === JSON.stringify(accepted.extra ?? {}),
  );
}
