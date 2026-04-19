const BASE_URL = "https://hackjlu.vercel.app";

function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = localStorage.getItem("admin_token");
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const adminKey = localStorage.getItem("admin_api_key");
  if (adminKey) headers["x-admin-key"] = adminKey;
  return headers;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { ...getHeaders(), ...options?.headers },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

// Auth
export const adminLogin = (walletAddress: string, signature: string) => {
  const payload = { walletAddress, signature };
  console.log("POST /api/auth/admin", payload);

  return request<{ token: string; user: { id: string; walletAddress: string; username: string } }>(
    "/api/auth/admin",
    { method: "POST", body: JSON.stringify(payload) }
  );
};

// Teams
export const getTeams = () => request<{ data: Team[] }>("/api/teams");
export const createTeam = (body: { name: string; game: string; region: string; logoUrl?: string }) =>
  request<{ team: Team }>("/api/admin/teams", { method: "POST", body: JSON.stringify(body) });

// Collections
export const createCollection = (body: { name: string; description: string; collectionMint: string; metadataUri: string }) =>
  request<{ collection: Collection }>("/api/admin/collections", { method: "POST", body: JSON.stringify(body) });

// Assets
export const getAssets = () => request<{ data: Asset[] }>("/api/assets");
export const mintAsset = (body: { name: string; teamId: string; collectionId: string; totalSupply: number; basePrice: number; kFactor: number }) =>
  request<{ asset: Asset }>("/api/admin/assets/mint", { method: "POST", body: JSON.stringify(body) });
export const getAssetTransactions = (assetId: string) =>
  request<{ message: string; asset: AdminAssetSummary; count: number; data: AdminTransaction[] }>(
    `/api/admin/assets/${assetId}/transactions`
  );
export const getAssetHolders = (assetId: string) =>
  request<{ message: string; asset: AdminAssetSummary; holdersCount: number; totalHeld: number; data: AssetHolder[] }>(
    `/api/admin/assets/${assetId}/holders`
  );

// Matches
export const getMatches = () => request<{ data: Match[] }>("/api/matches");
export const createMatch = (body: { teamAId: string; teamBId: string; tournament: string; startTime: string }) =>
  request<{ match: Match }>("/api/admin/matches", { method: "POST", body: JSON.stringify(body) });
export const setMatchResult = (body: { matchId: string; winner: "TEAM_A" | "TEAM_B" }) =>
  request<{ match: Match }>("/api/admin/matches/result", { method: "POST", body: JSON.stringify(body) });

// Markets
export const getMarkets = () => request<{ data: Market[] }>("/api/markets");
export const createMarket = (body: { matchId: string; basePrice: number; kFactor: number; initialLiquidity: number }) =>
  request<{ market: Market }>("/api/admin/markets", { method: "POST", body: JSON.stringify(body) });
export const addLiquidity = (body: { marketId: string; amount: number }) =>
  request<{ market: Market }>("/api/admin/markets/liquidity", { method: "POST", body: JSON.stringify(body) });

// Debug
export const getExchangeState = () => request<{ teams: number; assets: number; matches: number; markets: number }>("/api/debug/exchange-state");
export const getAdminTransactions = (txType?: AdminTransactionType) => {
  const query = txType ? `?txType=${encodeURIComponent(txType)}` : "";
  return request<{ message: string; filter: { txType?: AdminTransactionType }; count: number; data: AdminTransaction[] }>(
    `/api/admin/transactions${query}`
  );
};

// Types
export interface Team {
  id: string; name: string; game: string; region: string; logoUrl?: string; createdAt: string;
}
export interface Collection {
  id: string; name: string; description: string; collectionMint: string; metadataUri: string; createdAt: string;
}
export interface Asset {
  id: string; name: string; assetType: string; teamId: string; collectionId: string;
  mintAddress: string; metadataUri: string; basePrice: number; currentPrice: number;
  totalSupply: number; circulating: number; bondingCurveK: number; createdAt: string;
  team?: Team; collection?: Collection;
}
export interface Match {
  id: string; teamAId: string; teamBId: string; tournament: string; startTime: string;
  status: string; result: string | null; createdAt: string; teamA?: Team; teamB?: Team;
}
export interface Market {
  id: string; matchId: string; contractAddr: string; liquidityPool: number;
  supplyA: number; supplyB: number; basePrice: number; curveK: number;
  status: string; createdAt: string; match?: Match; teamAPrice?: number; teamBPrice?: number;
}

export type AdminTransactionType =
  | "BUY_ASSET"
  | "SELL_ASSET"
  | "BUY_PREDICTION"
  | "SELL_PREDICTION"
  | "CLAIM_REWARD";

export interface AdminAssetSummary {
  id: string;
  name: string;
  circulating: number;
  totalSupply: number;
  currentPrice: number;
}

export interface AdminTransaction {
  id: string;
  userId: string;
  txType: AdminTransactionType;
  assetId: string | null;
  marketId: string | null;
  quantity: number;
  amountUsdc: number;
  txSignature: string;
  createdAt: string;
  user: AdminTransactionUser;
}

export interface AdminTransactionUser {
  id: string;
  walletAddress: string;
  username: string;
}

export interface AssetHolder {
  id: string;
  userId: string;
  assetId: string;
  quantity: number;
  avgPrice: number;
  createdAt: string;
  user: AdminTransactionUser;
}
