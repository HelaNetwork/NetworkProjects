import { apiRequest } from "@/services/api";
import { UserProfile } from "@/types";

type BackendUser = {
  id: string;
  walletAddress: string;
  walletType: string | null;
  username: string | null;
  avatarUrl: string | null;
  country: string | null;
  bio: string | null;
  kycStatus: string | null;
  referralCode: string | null;
  referredById: string | null;
  joinDate: string | null;
  isActive: boolean;
};

type BackendUserProfileResponse = {
  message?: string;
  user: BackendUser;
};

function toDisplayJoinDate(iso?: string | null): string {
  if (!iso) return new Date().toISOString().split("T")[0];
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toISOString().split("T")[0];
}

export async function fetchUserProfile(): Promise<UserProfile> {
  const response = await apiRequest<BackendUserProfileResponse>(
    "/user/profile",
    {
      method: "GET",
    },
  );

  const user = response.user;

  return {
    walletAddress: user.walletAddress,
    username: user.username ?? "user",
    avatar: user.avatarUrl ?? undefined,
    country: user.country ?? undefined,
    joinDate: toDisplayJoinDate(user.joinDate),
    totalInvested: 0,
    totalYield: 0,
    claimableYield: 0,
    listedProperties: 0,
    badges: [],
    referralCode: user.referralCode ?? "",
    portfolioHistory: [],
    yieldHistory: [],
  };
}
