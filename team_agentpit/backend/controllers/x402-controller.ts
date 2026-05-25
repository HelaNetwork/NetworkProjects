import type { Request, Response } from "express";
import { env } from "../config/env.js";
import { sendJson } from "../lib/http.js";

const DEFAULT_FACILITATOR_URL = "https://facilitator.x402.org";

type SupportedKind = {
  x402Version: number;
  scheme: string;
  network: string;
};

export async function x402SupportedController(_req: Request, res: Response) {
  const facilitatorUrl = env.x402FacilitatorUrl ?? DEFAULT_FACILITATOR_URL;
  const configuredNetwork = env.proposalSubmissionNetwork;

  try {
    const response = await fetch(`${facilitatorUrl.replace(/\/$/, "")}/supported`);
    if (!response.ok) {
      return sendJson(
        res,
        {
          ok: false,
          error: `Facilitator returned ${response.status}`,
          configured: {
            enabled: Boolean(env.proposalSubmissionPayTo),
            payTo: env.proposalSubmissionPayTo ?? null,
            price: env.proposalSubmissionPriceUsd,
            network: configuredNetwork,
            facilitatorUrl,
          },
          supported: null,
          supportsConfiguredNetwork: false,
        },
        502,
      );
    }

    const supported = (await response.json()) as {
      kinds?: SupportedKind[];
      extensions?: unknown[];
      signers?: Record<string, string[]>;
    };

    const kinds = Array.isArray(supported.kinds) ? supported.kinds : [];
    const supportsConfiguredNetwork = kinds.some(
      (kind) =>
        kind.x402Version === 2 && kind.scheme === "exact" && kind.network === configuredNetwork,
    );

    return sendJson(res, {
      ok: true,
      configured: {
        enabled: Boolean(env.proposalSubmissionPayTo),
        payTo: env.proposalSubmissionPayTo ?? null,
        price: env.proposalSubmissionPriceUsd,
        network: configuredNetwork,
        facilitatorUrl,
      },
      supported,
      supportsConfiguredNetwork,
    });
  } catch (error) {
    return sendJson(
      res,
      {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
        configured: {
          enabled: Boolean(env.proposalSubmissionPayTo),
          payTo: env.proposalSubmissionPayTo ?? null,
          price: env.proposalSubmissionPriceUsd,
          network: configuredNetwork,
          facilitatorUrl,
        },
        supported: null,
        supportsConfiguredNetwork: false,
      },
      502,
    );
  }
}
