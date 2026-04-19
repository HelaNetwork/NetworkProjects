import { apiRequest } from "@/services/api";

export type PortfolioSummary = {
  totalHoldings: number;
  totalValue: number;
  totalCost: number;
  totalUnrealizedPnl: number;
  totalUnrealizedPnlPct: number;
};

export type PortfolioHolding = {
  holdingId: string;
  asset: {
    id: string;
    name: string;
    assetType: string;
    mintAddress: string;
    metadataUri?: string | null;
    team?: { id: string; name: string; logoUrl: string | null } | null;
    collection?: { id: string; name: string } | null;
  };
  quantity: number;
  avgBuyPrice: number;
  currentPrice: number;
  currentValue: number;
  costBasis: number;
  unrealizedPnl: number;
  unrealizedPnlPct: number;
  acquiredAt: string;
};

type PortfolioResponse = {
  message: string;
  summary: PortfolioSummary;
  holdings: PortfolioHolding[];
};

export async function fetchUserPortfolio(): Promise<{
  summary: PortfolioSummary;
  holdings: PortfolioHolding[];
}> {
  const response = await apiRequest<PortfolioResponse>("/api/user/portfolio", {
    method: "GET",
    requiresAuth: true,
  });

  return {
    summary: response.summary ?? {
      totalHoldings: 0,
      totalValue: 0,
      totalCost: 0,
      totalUnrealizedPnl: 0,
      totalUnrealizedPnlPct: 0,
    },
    holdings: response.holdings ?? [],
  };
}
