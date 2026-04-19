import { apiRequest } from "@/services/api";

type NumericLike = number | string | null | undefined;

export type YieldClaimRequestItem = {
  propertyId: string;
  distributionId: string;
};

export type ClaimableYield = {
  walletAddress: string;
  totalClaimable: number;
  claims: YieldClaimRequestItem[];
};

type ClaimableYieldResponse = {
  walletAddress?: string;
  wallet?: string;
  totalClaimable?: NumericLike;
  claimable?: NumericLike;
  claims?: Array<{
    propertyId?: string;
    distributionId?: string;
  }>;
};

type InitiateClaimResponse = {
  unsignedTx: string;
  totalClaimable?: NumericLike;
};

type ConfirmClaimResponse = {
  totalClaimed?: NumericLike;
  updatedBalance?: NumericLike;
};

export type ConfirmYieldClaimResult = {
  totalClaimed: number;
  updatedBalance: number;
};

function toNumber(value: NumericLike, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

export async function fetchClaimableYield(
  walletAddress: string,
): Promise<ClaimableYield> {
  const response = await apiRequest<ClaimableYieldResponse>(
    `/api/yield/claimable?wallet=${encodeURIComponent(walletAddress)}`,
    {
      method: "GET",
      requiresAuth: true,
    },
  );

  const claims = (response.claims ?? [])
    .filter(
      (item): item is { propertyId: string; distributionId: string } =>
        !!item?.propertyId && !!item?.distributionId,
    )
    .map((item) => ({
      propertyId: item.propertyId,
      distributionId: item.distributionId,
    }));

  return {
    walletAddress: response.walletAddress ?? response.wallet ?? walletAddress,
    totalClaimable: toNumber(response.totalClaimable ?? response.claimable),
    claims,
  };
}

export async function initiateYieldClaim(params: {
  walletAddress: string;
  claims: YieldClaimRequestItem[];
}): Promise<InitiateClaimResponse> {
  return apiRequest<InitiateClaimResponse>("/api/yield/claim", {
    method: "POST",
    body: params,
    requiresAuth: true,
  });
}

export async function confirmYieldClaim(params: {
  txSignature: string;
  claims: YieldClaimRequestItem[];
}): Promise<ConfirmYieldClaimResult> {
  const response = await apiRequest<ConfirmClaimResponse>(
    "/api/yield/confirm-claim",
    {
      method: "POST",
      body: params,
      requiresAuth: true,
    },
  );

  return {
    totalClaimed: toNumber(response.totalClaimed),
    updatedBalance: toNumber(response.updatedBalance),
  };
}
