import {
    ListingBasicInfoPayload,
    ListingLegalDocsPayload,
    ListingMediaUploadsPayload,
    ListingTokenomicsPayload,
} from "@/services/listingDraft";
import { create } from "zustand";

type ListingDraftStoreState = {
  draftId: string | null;
  basicInfo: ListingBasicInfoPayload | null;
  tokenomics: ListingTokenomicsPayload | null;
  mediaUploads: ListingMediaUploadsPayload | null;
  legalDocs: ListingLegalDocsPayload | null;
  setDraftId: (draftId: string | null) => void;
  setBasicInfo: (payload: ListingBasicInfoPayload) => void;
  setTokenomics: (payload: ListingTokenomicsPayload) => void;
  setMediaUploads: (payload: ListingMediaUploadsPayload) => void;
  setLegalDocs: (payload: ListingLegalDocsPayload) => void;
  reset: () => void;
};

export const useListingDraftStore = create<ListingDraftStoreState>((set) => ({
  draftId: null,
  basicInfo: null,
  tokenomics: null,
  mediaUploads: null,
  legalDocs: null,

  setDraftId: (draftId) => set({ draftId }),
  setBasicInfo: (basicInfo) => set({ basicInfo }),
  setTokenomics: (tokenomics) => set({ tokenomics }),
  setMediaUploads: (mediaUploads) => set({ mediaUploads }),
  setLegalDocs: (legalDocs) => set({ legalDocs }),

  reset: () =>
    set({
      draftId: null,
      basicInfo: null,
      tokenomics: null,
      mediaUploads: null,
      legalDocs: null,
    }),
}));
