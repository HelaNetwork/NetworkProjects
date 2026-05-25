import { HTTPFacilitatorClient } from "@x402/core/server";
import { ExactEvmScheme } from "@x402/evm/exact/server";
import { paymentMiddleware, x402ResourceServer } from "@x402/express";
import type { RequestHandler } from "express";
import { env } from "../config/env.js";

const noopMiddleware: RequestHandler = (_req, _res, next) => {
  next();
};

function buildProposalPaymentMiddleware(): RequestHandler {
  if (!env.proposalSubmissionPayTo) {
    return noopMiddleware;
  }

  const facilitator = env.x402FacilitatorUrl
    ? new HTTPFacilitatorClient({ url: env.x402FacilitatorUrl })
    : new HTTPFacilitatorClient();

  const server = new x402ResourceServer(facilitator).register(
    env.proposalSubmissionNetwork,
    new ExactEvmScheme(),
  );

  const paywallMiddleware = paymentMiddleware(
    {
      "POST /": {
        accepts: {
          scheme: "exact",
          network: env.proposalSubmissionNetwork,
          payTo: env.proposalSubmissionPayTo,
          price: env.proposalSubmissionPriceUsd,
        },
        description: "Submit a strategy proposal",
      },
    },
    server,
    undefined,
    undefined,
    env.x402SyncOnStart,
  );

  if (env.x402SyncOnStart) {
    return paywallMiddleware;
  }

  let initialized = false;
  let initializePromise: Promise<void> | undefined;

  async function ensureInitialized() {
    if (initialized) {
      return;
    }

    if (!initializePromise) {
      initializePromise = server
        .initialize()
        .then(() => {
          initialized = true;
        })
        .catch((error) => {
          initializePromise = undefined;
          throw error;
        });
    }

    await initializePromise;
  }

  return async (req, res, next) => {
    try {
      if (isWithdrawProposal(req.body)) {
        return next();
      }

      await ensureInitialized();
      await paywallMiddleware(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}

export const proposalPaymentGateway = buildProposalPaymentMiddleware();

function isWithdrawProposal(body: unknown) {
  if (!body || typeof body !== "object") {
    return false;
  }

  const protocol = (body as { protocolPlan?: { protocol?: unknown } }).protocolPlan?.protocol;
  return protocol === "aave-v3-withdraw";
}
