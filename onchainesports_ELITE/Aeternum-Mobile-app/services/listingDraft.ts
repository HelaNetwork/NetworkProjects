import { apiRequest } from "@/services/api";

export type ListingBasicInfoPayload = {
  name: string;
  type: string;
  country: string;
  city: string;
  addressFull?: string;
  description: string;
  yearBuilt?: number;
  areaSqft?: number;
};

export type ListingTokenomicsPayload = {
  tokenModel: string;
  totalValuation: number | string;
  pricePerShare: number;
  totalShares: number;
  availableShares: number;
  yieldPercent: number;
  monthlyRental: number | string;
  operatingCosts: number | string;
  managementFeePct: number;
  insuranceCost: number | string;
  capRate: number;
  occupancyPct: number;
};

export type ListingMediaUploadsPayload = {
  coverImageUrl?: string;
  images?: string[];
  videoUrl?: string;
};

export type ListingLegalDocsPayload = {
  titleDeedUrl?: string;
  ownershipProofUrl?: string;
  complianceCertificateUrl?: string;
};

export type ListingDraft = {
  id: string;
  step: number;
  status?: string;
  basicInfo?: unknown;
  tokenomics?: unknown;
  mediaUploads?: unknown;
  legalDocs?: unknown;
  createdAt?: string;
  updatedAt?: string;
};

type CreateDraftStep1Request = {
  step: 1;
  basicInfo: ListingBasicInfoPayload;
};

type UpdateDraftRequest =
  | {
      step: 2;
      tokenomics: ListingTokenomicsPayload;
    }
  | {
      step: 3;
      mediaUploads: ListingMediaUploadsPayload;
    }
  | {
      step: 4;
      legalDocs: ListingLegalDocsPayload;
    };

type DraftResponse = {
  message?: string;
  draft: ListingDraft;
};

type DraftListItem = {
  id: string;
  stepCompleted: number;
  submittedAt: string | null;
  workflowStatus: string;
  step1Data: {
    name?: string;
    city?: string;
    country?: string;
    type?: string;
  } | null;
  step2Data: {
    totalValuation?: number;
    yieldPercent?: number;
  } | null;
  step3Data: {
    coverImageUrl?: string;
    images?: string[];
  } | null;
};

type DraftListResponse = {
  message?: string;
  data: DraftListItem[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

type DraftStep1Data = {
  city?: string;
  name?: string;
  type?: string;
  country?: string;
  areaSqft?: number;
  yearBuilt?: number;
  addressFull?: string;
  description?: string;
};

type DraftStep2Data = {
  tokenModel?: string;
  totalShares?: number;
  yieldPercent?: number;
  pricePerShare?: number;
  totalValuation?: number | string;
  availableShares?: number;
  monthlyRental?: number | string | null;
  operatingCosts?: number | string | null;
  managementFeePct?: number | null;
  insuranceCost?: number | string | null;
  capRate?: number | null;
  occupancyPct?: number | null;
};

type DraftStep3Data = {
  images?: string[];
  videoUrl?: string;
  coverImageUrl?: string;
};

type DraftStep4Data = {
  titleDeedUrl?: string;
  ownershipProofUrl?: string;
  complianceCertificateUrl?: string;
};

export type ListingDraftDetail = {
  id: string;
  userWallet: string;
  stepCompleted: number;
  step1Data: DraftStep1Data | null;
  step2Data: DraftStep2Data | null;
  step3Data: DraftStep3Data | null;
  step4Data: DraftStep4Data | null;
  submittedAt: string | null;
  propertyId: string | null;
  property: unknown;
  workflowStatus: string;
};

type DraftDetailResponse = {
  message?: string;
  draft: ListingDraftDetail;
};

export type MintPropertyResponse = {
  message: string;
  mintAddress: string;
  metadataUri: string;
  treasuryPDA: string;
  txSignature: string;
  property: {
    id: string;
    status: string;
  };
};

type UploadImageResponse = {
  message?: string;
  url?: string;
  imageUrl?: string;
  fileUrl?: string;
  data?: {
    url?: string;
    fileUrl?: string;
  };
};

export async function createListingDraftStep1(
  payload: CreateDraftStep1Request,
): Promise<ListingDraft> {
  const response = await apiRequest<DraftResponse>("/property/listings/draft", {
    method: "POST",
    body: payload,
  });

  return response.draft;
}

export async function updateListingDraft(
  draftId: string,
  payload: UpdateDraftRequest,
): Promise<ListingDraft> {
  const response = await apiRequest<DraftResponse>(
    `/property/listings/${draftId}`,
    {
      method: "PATCH",
      body: payload,
    },
  );

  return response.draft;
}

export async function submitListingDraft(
  draftId: string,
): Promise<ListingDraft> {
  const response = await apiRequest<DraftResponse>(
    `/property/listings/${draftId}/submit`,
    {
      method: "POST",
      body: {},
    },
  );

  return response.draft;
}

export async function uploadListingImage(file: {
  uri: string;
  name?: string;
  type?: string;
}): Promise<string> {
  const formData = new FormData();
  formData.append("file", {
    uri: file.uri,
    name: file.name ?? "image.jpg",
    type: file.type ?? "image/jpeg",
  } as any);

  const response = await apiRequest<UploadImageResponse>(
    "/property/upload/image",
    {
      method: "POST",
      body: formData,
    },
  );

  if (typeof response === "string") {
    return response;
  }

  return (
    response.url ??
    response.imageUrl ??
    response.fileUrl ??
    response.data?.url ??
    response.data?.fileUrl ??
    ""
  );
}

export type ListingDraftListItem = DraftListItem;

export async function fetchListingDrafts(
  page = 1,
  limit = 10,
): Promise<ListingDraftListItem[]> {
  const response = await apiRequest<DraftListResponse>(
    `/property/listings/drafts?page=${page}&limit=${limit}`,
    {
      method: "GET",
    },
  );

  return response.data ?? [];
}

export async function fetchListingDraftById(
  draftId: string,
): Promise<ListingDraftDetail> {
  const response = await apiRequest<DraftDetailResponse>(
    `/property/listings/drafts/${draftId}`,
    {
      method: "GET",
    },
  );

  return response.draft;
}

export async function mintPropertyFromDraft(
  draftId: string,
): Promise<MintPropertyResponse> {
  return apiRequest<MintPropertyResponse>("/property/mint/property", {
    method: "POST",
    body: { draftId },
  });
}
