import { apiRequest } from "@/services/api";
import { Listing, Property } from "@/types";

type PrismaDecimalJson = {
  s: number;
  e: number;
  d: number[];
};

type NumericLike = number | string | PrismaDecimalJson | null;

type BackendProperty = {
  id: string;
  ownerWallet: string;
  name: string;
  type: string;
  tokenModel: string | null;
  country: string;
  city: string;
  addressFull: string | null;
  description: string | null;
  yearBuilt: NumericLike;
  areaSqft: NumericLike;
  totalValuation: NumericLike;
  pricePerShare: NumericLike;
  totalShares: NumericLike;
  availableShares: NumericLike;
  yieldPercent: NumericLike;
  monthlyRental: NumericLike;
  operatingCosts: NumericLike;
  managementFeePct: NumericLike;
  insuranceCost: NumericLike;
  capRate: NumericLike;
  occupancyPct: NumericLike;
  status: string;
  mintAddress: string | null;
  metadataUri: string | null;
  collectionAddress: string | null;
  treasuryPda: string | null;
  coverImageUrl: string | null;
  images: string[] | null;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
};

type PropertiesResponse = {
  message?: string;
  data: Array<BackendProperty | null>;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

function isPrismaDecimalJson(value: unknown): value is PrismaDecimalJson {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<PrismaDecimalJson>;
  return (
    typeof candidate.s === "number" &&
    typeof candidate.e === "number" &&
    Array.isArray(candidate.d) &&
    candidate.d.every((part) => typeof part === "number")
  );
}

function prismaDecimalJsonToNumber(value: PrismaDecimalJson): number | null {
  if (!Array.isArray(value.d) || value.d.length === 0) return null;
  const coefficient = value.d
    .map((part, index) =>
      index === 0 ? String(part) : String(part).padStart(7, "0"),
    )
    .join("");

  if (!/^\d+$/.test(coefficient)) return null;

  const decimalExponent = value.e + 1 - coefficient.length;
  const sign = value.s < 0 ? "-" : "";
  const asNumber = Number(`${sign}${coefficient}e${decimalExponent}`);

  return Number.isFinite(asNumber) ? asNumber : null;
}

function toNumber(value: NumericLike, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  if (isPrismaDecimalJson(value)) {
    return prismaDecimalJsonToNumber(value) ?? fallback;
  }
  return fallback;
}

function toOptionalNumber(value: NumericLike): number | undefined {
  const parsed = toNumber(value, Number.NaN);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function toPropertyType(rawType: string): Property["type"] {
  const normalized = rawType?.trim().toLowerCase();
  if (normalized === "commercial") return "Commercial";
  if (normalized === "industrial") return "Industrial";
  if (normalized === "mixed-use" || normalized === "mixed use")
    return "Mixed-Use";
  return "Residential";
}

function toPropertyStatus(rawStatus: string): Property["status"] {
  const normalized = rawStatus?.trim().toLowerCase();
  if (normalized === "sold_out" || normalized === "soldout") return "sold_out";
  if (normalized === "pending") return "pending";
  return "active";
}

function mapBackendProperty(item: BackendProperty): Property {
  const images =
    item.images && item.images.length > 0
      ? item.images
      : item.coverImageUrl
        ? [item.coverImageUrl]
        : [];

  const totalShares = toNumber(item.totalShares);
  const availableShares = toNumber(item.availableShares);
  const pricePerShare = toNumber(item.pricePerShare);

  return {
    id: item.id,
    name: item.name,
    location: [item.city, item.country].filter(Boolean).join(", "),
    country: item.country,
    city: item.city,
    type: toPropertyType(item.type),
    image: item.coverImageUrl ?? images[0] ?? "",
    images,
    description: item.description ?? "No description available",
    totalValuation: toNumber(item.totalValuation),
    tokenizedAmount: totalShares * pricePerShare,
    pricePerShare,
    totalShares,
    availableShares,
    yieldPercent: toNumber(item.yieldPercent),
    monthlyRental: toNumber(item.monthlyRental),
    operatingCosts: toNumber(item.operatingCosts),
    managementFeePercent: toNumber(item.managementFeePct),
    insuranceCost: toNumber(item.insuranceCost),
    capRate: toNumber(item.capRate),
    occupancy: toNumber(item.occupancyPct),
    totalInvestors: 0,
    status: toPropertyStatus(item.status),
    yearBuilt: toOptionalNumber(item.yearBuilt),
    areaSize: toOptionalNumber(item.areaSqft),
    isFeatured: item.isFeatured,
  };
}

function mapBackendListing(item: BackendProperty): Listing {
  const totalShares = toNumber(item.totalShares);
  const availableShares = toNumber(item.availableShares);
  const pricePerShare = toNumber(item.pricePerShare);
  const soldShares = Math.max(0, totalShares - availableShares);

  const normalizedStatus = item.status?.trim().toLowerCase();
  const status: Listing["status"] =
    normalizedStatus === "live"
      ? "live"
      : normalizedStatus === "approved"
        ? "approved"
        : normalizedStatus === "rejected"
          ? "rejected"
          : normalizedStatus === "pending"
            ? "pending"
            : "draft";

  return {
    id: item.id,
    propertyName: item.name,
    status,
    investors: 0,
    amountRaised: soldShares * pricePerShare,
    totalTarget: totalShares * pricePerShare,
    image: item.coverImageUrl ?? item.images?.[0] ?? undefined,
    createdAt: item.createdAt,
    city: item.city,
    country: item.country,
    yieldPercent: toNumber(item.yieldPercent),
  };
}

export async function fetchProperties(
  page = 1,
  limit = 5000,
): Promise<Property[]> {
  const response = await apiRequest<PropertiesResponse>(
    `/property/properties?page=${page}&limit=${limit}`,
    {
      method: "GET",
      requiresAuth: false,
    },
  );

  return (response.data ?? [])
    .filter(
      (item): item is BackendProperty =>
        !!item && typeof item === "object" && typeof item.id === "string",
    )
    .map(mapBackendProperty);
}

export async function fetchPropertyById(id: string): Promise<Property | null> {
  const properties = await fetchProperties(1, 100);
  return properties.find((property) => property.id === id) ?? null;
}

export async function fetchMyListings(
  page = 1,
  limit = 100,
): Promise<Listing[]> {
  const response = await apiRequest<PropertiesResponse>(
    `/property/properties/my-listings?page=${page}&limit=${limit}`,
    {
      method: "GET",
      requiresAuth: true,
    },
  );

  return (response.data ?? [])
    .filter(
      (item): item is BackendProperty =>
        !!item && typeof item === "object" && typeof item.id === "string",
    )
    .map(mapBackendListing);
}
