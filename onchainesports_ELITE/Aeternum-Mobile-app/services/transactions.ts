import { ApiError, apiRequest } from "@/services/api";

type NumericLike = number | string | null;

export type PropertyQuote = {
  pricePerShare: number;
  platformFeeRate: number;
  usdcRequired: number;
  platformFee: number;
  availableShares: number;
};

type QuoteResponse = {
  pricePerShare: NumericLike;
  platformFeeRate: NumericLike;
  usdcRequired: NumericLike;
  platformFee: NumericLike;
  availableShares: NumericLike;
};

export type InitiateBuyResponse = {
  escrowPDA: string;
  usdcAmount: string;
  platformFee: string;
  unsignedTx: string;
};

export type SellQuote = {
  proceedsUsdc: number;
  feeAmount: number;
  netProceeds: number;
  pnl: number;
};

type SellQuoteResponse = {
  proceedsUsdc: NumericLike;
  feeAmount: NumericLike;
  netProceeds: NumericLike;
  pnl: NumericLike;
};

export type InitiateSellResponse = {
  unsignedTx: string;
};

export type ConfirmSellResponse = {
  message: string;
  quantity: number;
  totalPayout: number;
  feeBreakdown?: {
    feeBps: number;
    feeAmount: number;
    grossPayout: number;
    netPayout: number;
  };
  transaction?: {
    id: string;
    txType: string;
    txSignature: string;
    amountUsdc: number;
    createdAt: string;
  };
};

export type ConfirmBuyResponse = {
  success: boolean;
  investmentRecord?: {
    id: string;
    userWallet: string;
    propertyId: string;
    sharesOwned: number;
  };
  updatedInvestment?: {
    id: string;
    sharesOwned: number;
  };
  tokenAccountAddress?: string;
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function toNumber(value: NumericLike, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

export async function fetchPropertyQuote(
  propertyId: string,
  shares: number,
): Promise<PropertyQuote> {
  const response = await apiRequest<QuoteResponse>(
    `/api/properties/${propertyId}/quote?shares=${shares}`,
    {
      method: "GET",
      requiresAuth: true,
    },
  );

  return {
    pricePerShare: toNumber(response.pricePerShare),
    platformFeeRate: toNumber(response.platformFeeRate),
    usdcRequired: toNumber(response.usdcRequired),
    platformFee: toNumber(response.platformFee),
    availableShares: toNumber(response.availableShares),
  };
}

export async function initiateBuyTransaction(params: {
  propertyId: string;
  shares: number;
  walletAddress: string;
}): Promise<InitiateBuyResponse> {
  return apiRequest<InitiateBuyResponse>("/api/transactions/initiate-buy", {
    method: "POST",
    body: params,
    requiresAuth: true,
  });
}

export async function fetchSellQuote(params: {
  propertyId: string;
  shares: number;
  walletAddress: string;
}): Promise<SellQuote> {
  const response = await apiRequest<SellQuoteResponse>(
    `/api/investments/${params.propertyId}/sell-quote?shares=${params.shares}&walletAddress=${encodeURIComponent(params.walletAddress)}`,
    {
      method: "GET",
      requiresAuth: true,
    },
  );

  return {
    proceedsUsdc: toNumber(response.proceedsUsdc),
    feeAmount: toNumber(response.feeAmount),
    netProceeds: toNumber(response.netProceeds),
    pnl: toNumber(response.pnl),
  };
}

export async function initiateSellTransaction(params: {
  propertyId: string;
  shares: number;
  walletAddress: string;
}): Promise<InitiateSellResponse> {
  return apiRequest<InitiateSellResponse>("/api/transactions/initiate-sell", {
    method: "POST",
    body: params,
    requiresAuth: true,
  });
}

// ─── User transaction history ────────────────────────────────────────────────

export type UserTransaction = {
  id: string;
  userId: string;
  txType: string;
  assetId: string | null;
  marketId: string | null;
  quantity: number;
  amountUsdc: number;
  txSignature: string;
  createdAt: string;
};

type UserTransactionsResponse = {
  message: string;
  pagination: { total: number; limit: number; offset: number };
  transactions: UserTransaction[];
};

export async function fetchUserTransactions(
  limit = 20,
  offset = 0,
): Promise<{
  transactions: UserTransaction[];
  pagination: { total: number; limit: number; offset: number };
}> {
  const response = await apiRequest<UserTransactionsResponse>(
    `/api/user/transactions?limit=${limit}&offset=${offset}`,
    { method: "GET", requiresAuth: true },
  );
  return {
    transactions: response.transactions ?? [],
    pagination: response.pagination,
  };
}

// ──── Asset trading: buy ─────────────────────────────────────────────────────

export type BuyPreview = {
  assetId: string;
  assetName: string;
  quantity: number;
  baseCost: number;
  totalCost: number;
  feeBreakdown: { feeBps: number; feeAmount: number };
  currentPrice: number;
};

type PrepareBuyResponse = { unsignedTx: string; preview: BuyPreview };

export async function prepareBuyAsset(params: {
  assetId: string;
  quantity: number;
}): Promise<PrepareBuyResponse> {
  return apiRequest<PrepareBuyResponse>("/api/assets/buy/prepare", {
    method: "POST",
    body: params,
    requiresAuth: true,
  });
}

export async function confirmBuyAsset(params: {
  txSignature: string;
  assetId: string;
  quantity: number;
}): Promise<unknown> {
  // Mobile network can briefly drop after returning from wallet app; retry
  // network-level failures only (status 0) to avoid masking real API errors.
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await apiRequest("/api/assets/buy/confirm", {
        method: "POST",
        body: params,
        requiresAuth: true,
      });
    } catch (error) {
      const isNetworkFailure = error instanceof ApiError && error.status === 0;
      const isLastAttempt = attempt === maxAttempts;

      if (!isNetworkFailure || isLastAttempt) {
        throw error;
      }

      console.warn("[Transactions] buy confirm retry after network failure", {
        attempt,
        txSignature: params.txSignature,
        assetId: params.assetId,
      });

      await sleep(500 * attempt);
    }
  }

  throw new Error("Buy confirm failed after retries");
}

// ──── Asset trading: sell ────────────────────────────────────────────────────

export type SellPreview = {
  assetId: string;
  assetName: string;
  quantity: number;
  grossPayout: number;
  netPayout: number;
  feeBreakdown: { feeBps: number; feeAmount: number };
  currentPrice: number;
};

type PrepareSellResponse = { unsignedTx: string; preview: SellPreview };

export async function prepareSellAsset(params: {
  assetId: string;
  quantity: number;
}): Promise<PrepareSellResponse> {
  return apiRequest<PrepareSellResponse>("/api/assets/sell/prepare", {
    method: "POST",
    body: params,
    requiresAuth: true,
  });
}

export async function confirmSellAsset(params: {
  txSignature: string;
  assetId: string;
  quantity: number;
}): Promise<ConfirmSellResponse> {
  // Mobile network can briefly drop after returning from wallet app; retry
  // network-level failures only (status 0) to avoid masking real API errors.
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await apiRequest<ConfirmSellResponse>("/api/assets/sell/confirm", {
        method: "POST",
        body: params,
        requiresAuth: true,
      });
    } catch (error) {
      const isNetworkFailure = error instanceof ApiError && error.status === 0;
      const isLastAttempt = attempt === maxAttempts;

      if (!isNetworkFailure || isLastAttempt) {
        throw error;
      }

      console.warn("[Transactions] sell confirm retry after network failure", {
        attempt,
        txSignature: params.txSignature,
        assetId: params.assetId,
      });

      await sleep(500 * attempt);
    }
  }

  throw new Error("Sell confirm failed after retries");
}

// ──── Legacy property transactions (kept for compatibility) ──────────────────

// ──── Prediction market trading ───────────────────────────────────────────────

export type PredictionSide = "TEAM_A" | "TEAM_B";

export type PredictionBuyPreview = {
  marketId: string;
  side: PredictionSide;
  quantity: number;
  baseCost: number;
  totalCost: number;
  feeBreakdown: { feeBps: number; feeAmount: number };
  teamAName: string;
  teamBName: string;
};

type PreparePredictionBuyResponse = {
  unsignedTx: string;
  preview: PredictionBuyPreview;
};

export type ConfirmPredictionBuyResponse = {
  message: string;
  market: {
    id: string;
    matchId: string;
    contractAddr: string;
    liquidityPool: number;
    supplyA: number;
    supplyB: number;
    basePrice: number;
    curveK: number;
    status: string;
    createdAt: string;
  };
  quantity: number;
  totalCost: number;
  feeBreakdown: {
    feeBps: number;
    feeAmount: number;
    baseCost: number;
  };
  transaction: UserTransaction;
};

export type PredictionSellPreview = {
  marketId: string;
  side: PredictionSide;
  quantity: number;
  grossPayout: number;
  netPayout: number;
  feeBreakdown: { feeBps: number; feeAmount: number };
  teamAName: string;
  teamBName: string;
};

type PreparePredictionSellResponse = {
  unsignedTx: string;
  preview: PredictionSellPreview;
};

export type ConfirmPredictionSellResponse = {
  message: string;
  market: {
    id: string;
    matchId: string;
    contractAddr: string;
    liquidityPool: number;
    supplyA: number;
    supplyB: number;
    basePrice: number;
    curveK: number;
    status: string;
    createdAt: string;
  };
  quantity: number;
  totalPayout: number;
  feeBreakdown: {
    feeBps: number;
    feeAmount: number;
    grossPayout: number;
    netPayout: number;
  };
  transaction: UserTransaction;
};

export type PredictionClaimPreview = {
  marketId: string;
  winningSide: PredictionSide;
  winningAmount: number;
  grossPayout: number;
  netPayout: number;
  feeBreakdown: { feeBps: number; feeAmount: number };
  teamAName: string;
  teamBName: string;
};

type PreparePredictionClaimResponse = {
  unsignedTx: string;
  preview: PredictionClaimPreview;
};

export type ConfirmPredictionClaimResponse = {
  message: string;
  payout: number;
  transaction: UserTransaction;
};

export async function prepareBuyPrediction(params: {
  marketId: string;
  side: PredictionSide;
  quantity: number;
}): Promise<PreparePredictionBuyResponse> {
  return apiRequest<PreparePredictionBuyResponse>("/api/markets/buy/prepare", {
    method: "POST",
    body: params,
    requiresAuth: true,
  });
}

export async function confirmBuyPrediction(params: {
  txSignature: string;
  marketId: string;
  side: PredictionSide;
  quantity: number;
}): Promise<ConfirmPredictionBuyResponse> {
  const maxAttempts = 5;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await apiRequest<ConfirmPredictionBuyResponse>(
        "/api/markets/buy/confirm",
        {
          method: "POST",
          body: params,
          requiresAuth: true,
        },
      );
    } catch (error) {
      const isNetworkFailure = error instanceof ApiError && error.status === 0;
      const isLastAttempt = attempt === maxAttempts;

      if (!isNetworkFailure || isLastAttempt) {
        throw error;
      }

      console.warn(
        "[Transactions] prediction buy confirm retry after network failure",
        {
          attempt,
          txSignature: params.txSignature,
          marketId: params.marketId,
        },
      );

      await sleep(800 * attempt);
    }
  }

  throw new Error("Prediction buy confirm failed after retries");
}

export async function prepareSellPrediction(params: {
  marketId: string;
  side: PredictionSide;
  quantity: number;
}): Promise<PreparePredictionSellResponse> {
  return apiRequest<PreparePredictionSellResponse>(
    "/api/markets/sell/prepare",
    {
      method: "POST",
      body: params,
      requiresAuth: true,
    },
  );
}

export async function confirmSellPrediction(params: {
  txSignature: string;
  marketId: string;
  side: PredictionSide;
  quantity: number;
}): Promise<ConfirmPredictionSellResponse> {
  const maxAttempts = 5;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await apiRequest<ConfirmPredictionSellResponse>(
        "/api/markets/sell/confirm",
        {
          method: "POST",
          body: params,
          requiresAuth: true,
        },
      );
    } catch (error) {
      const isNetworkFailure = error instanceof ApiError && error.status === 0;
      const isLastAttempt = attempt === maxAttempts;

      if (!isNetworkFailure || isLastAttempt) {
        throw error;
      }

      console.warn(
        "[Transactions] prediction sell confirm retry after network failure",
        {
          attempt,
          txSignature: params.txSignature,
          marketId: params.marketId,
        },
      );

      await sleep(800 * attempt);
    }
  }

  throw new Error("Prediction sell confirm failed after retries");
}

export async function prepareClaimPrediction(params: {
  marketId: string;
}): Promise<PreparePredictionClaimResponse> {
  return apiRequest<PreparePredictionClaimResponse>(
    "/api/markets/claim/prepare",
    {
      method: "POST",
      body: params,
      requiresAuth: true,
      logHttpFailure: false,
    },
  );
}

export async function confirmClaimPrediction(params: {
  txSignature: string;
  marketId: string;
}): Promise<ConfirmPredictionClaimResponse> {
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await apiRequest<ConfirmPredictionClaimResponse>(
        "/api/markets/claim/confirm",
        {
          method: "POST",
          body: params,
          requiresAuth: true,
        },
      );
    } catch (error) {
      const isNetworkFailure = error instanceof ApiError && error.status === 0;
      const isLastAttempt = attempt === maxAttempts;

      if (!isNetworkFailure || isLastAttempt) {
        throw error;
      }

      console.warn(
        "[Transactions] prediction claim confirm retry after network failure",
        {
          attempt,
          txSignature: params.txSignature,
          marketId: params.marketId,
        },
      );

      await sleep(500 * attempt);
    }
  }

  throw new Error("Prediction claim confirm failed after retries");
}

export async function confirmTransaction(params: {
  txSignature: string;
  propertyId: string;
  shares: number;
  side: "buy" | "sell";
}): Promise<ConfirmBuyResponse> {
  // Mobile network can briefly drop after returning from wallet app; retry
  // network-level failures only (status 0) to avoid masking real API errors.
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await apiRequest<ConfirmBuyResponse>("/api/transactions/confirm", {
        method: "POST",
        body: params,
        requiresAuth: true,
      });
    } catch (error) {
      const isNetworkFailure = error instanceof ApiError && error.status === 0;
      const isLastAttempt = attempt === maxAttempts;

      if (!isNetworkFailure || isLastAttempt) {
        throw error;
      }

      console.warn("[Transactions] confirm retry after network failure", {
        attempt,
        txSignature: params.txSignature,
        propertyId: params.propertyId,
      });

      await sleep(500 * attempt);
    }
  }

  throw new Error("Transaction confirm failed after retries");
}
