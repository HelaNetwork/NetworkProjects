import { apiRequest } from "@/services/api";

export type Asset = {
  id: string;
  name: string;
  assetType: string;
  teamId: string;
  collectionId: string;
  mintAddress: string;
  metadataUri?: string | null;
  basePrice: number;
  currentPrice: number;
  totalSupply: number;
  circulating: number;
  bondingCurveK: number;
  createdAt: string;
  team: {
    id: string;
    name: string;
    game: string;
    region: string;
    logoUrl?: string | null;
    createdAt: string;
  };
  collection: {
    id: string;
    name: string;
    description: string;
    collectionMint: string;
    metadataUri: string;
    createdAt: string;
  };
};

type AssetsResponse = {
  message: string;
  data: Asset[];
};

/**
 * Fetch all minted assets with current bonding curve prices
 */
export async function fetchAssets(): Promise<Asset[]> {
  const res = await apiRequest<AssetsResponse>("/api/assets", {
    method: "GET",
    requiresAuth: false,
  });
  return res.data ?? [];
}

/**
 * Get a single asset by ID
 */
export async function fetchAssetById(assetId: string): Promise<Asset | null> {
  const assets = await fetchAssets();
  return assets.find((a) => a.id === assetId) ?? null;
}
