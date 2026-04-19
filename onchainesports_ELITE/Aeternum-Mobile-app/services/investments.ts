import { apiRequest } from "@/services/api";
import {
    fetchUserTransactions,
    UserTransaction,
} from "@/services/transactions";
import type { Investment, Listing } from "@/types";

// ─── Portfolio API response types ────────────────────────────────────────────

type PortfolioSummary = {
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

// ─── Positions API response types ────────────────────────────────────────────

export type MarketPosition = {
  positionId: string;
  market: {
    id: string;
    status: string;
    match: {
      id: string;
      startTime: string;
      result: string | null;
      teamA: { id: string; name: string; logoUrl: string | null };
      teamB: { id: string; name: string; logoUrl: string | null };
    };
  };
  side: "TEAM_A" | "TEAM_B";
  amount: number;
  avgBuyPrice: number;
  currentPrice: number;
  currentValue: number;
  costBasis: number;
  unrealizedPnl: number;
  unrealizedPnlPct: number;
  openedAt: string;
};

type PositionsResponse = {
  message: string;
  totalPositions: number;
  positions: MarketPosition[];
};

export type WalletInvestmentsSummary = {
  walletAddress: string;
  totals: {
    propertiesCount: number;
    totalSharesOwned: number;
    totalPurchasePrice: number;
    totalCurrentValue: number;
    totalYieldEarned: number;
    totalClaimableYield: number;
  };
  holdings: PortfolioHolding[];
  positions: MarketPosition[];
  transactions: UserTransaction[];
  investments: Investment[];
  listings: Listing[];
};

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80";

export async function fetchMyInvestments(): Promise<WalletInvestmentsSummary> {
  const [portfolioRes, positionsRes, transactionsRes] = await Promise.all([
    apiRequest<PortfolioResponse>("/api/user/portfolio", {
      method: "GET",
      requiresAuth: true,
    }),
    apiRequest<PositionsResponse>("/api/user/positions", {
      method: "GET",
      requiresAuth: true,
    }),
    fetchUserTransactions(20, 0),
  ]);

  const holdingInvestments: Investment[] = (portfolioRes.holdings ?? []).map(
    (h): Investment => ({
      id: h.holdingId,
      propertyId: h.asset.id,
      propertyName: h.asset.name,
      propertyLocation: h.asset.collection?.name ?? h.asset.assetType,
      propertyImage: h.asset.metadataUri ?? FALLBACK_IMAGE,
      sharesOwned: h.quantity,
      pricePerShare: h.currentPrice,
      purchasePrice: h.costBasis,
      currentValue: h.currentValue,
      yieldEarned: h.unrealizedPnl > 0 ? h.unrealizedPnl : 0,
      claimableYield: 0,
      roi: h.unrealizedPnlPct,
      investedAt: h.acquiredAt,
    }),
  );

  const positionInvestments: Investment[] = (positionsRes.positions ?? []).map(
    (p): Investment => {
      const match = p.market.match;
      const sideName =
        p.side === "TEAM_A" ? match.teamA.name : match.teamB.name;
      return {
        id: p.positionId,
        propertyId: p.market.id,
        propertyName: `${match.teamA.name} vs ${match.teamB.name}`,
        propertyLocation: sideName,
        propertyImage: FALLBACK_IMAGE,
        sharesOwned: p.amount,
        pricePerShare: p.currentPrice,
        purchasePrice: p.costBasis,
        currentValue: p.currentValue,
        yieldEarned: p.unrealizedPnl > 0 ? p.unrealizedPnl : 0,
        claimableYield: 0,
        roi: p.unrealizedPnlPct,
        investedAt: p.openedAt,
      };
    },
  );

  const positions = positionsRes.positions ?? [];
  const positionsTotalValue = positions.reduce((s, p) => s + p.currentValue, 0);
  const positionsTotalCost = positions.reduce((s, p) => s + p.costBasis, 0);
  const positionsTotalPnl = positions.reduce((s, p) => s + p.unrealizedPnl, 0);

  const summary = portfolioRes.summary ?? {
    totalHoldings: 0,
    totalValue: 0,
    totalCost: 0,
    totalUnrealizedPnl: 0,
    totalUnrealizedPnlPct: 0,
  };
  const holdings = portfolioRes.holdings ?? [];
  const positionsList = positionsRes.positions ?? [];
  const transactions = transactionsRes.transactions ?? [];

  return {
    walletAddress: "",
    totals: {
      propertiesCount:
        summary.totalHoldings + (positionsRes.totalPositions ?? 0),
      totalSharesOwned: holdings.reduce((s, h) => s + h.quantity, 0),
      totalPurchasePrice: summary.totalCost + positionsTotalCost,
      totalCurrentValue: summary.totalValue + positionsTotalValue,
      totalYieldEarned: summary.totalUnrealizedPnl + positionsTotalPnl,
      totalClaimableYield: 0,
    },
    holdings,
    positions: positionsList,
    transactions,
    investments: [...holdingInvestments, ...positionInvestments],
    listings: [],
  };
}
