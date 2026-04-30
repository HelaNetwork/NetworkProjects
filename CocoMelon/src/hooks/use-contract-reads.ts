"use client";

import { useReadContract, useReadContracts, useAccount } from "wagmi";
import { CONTRACT_ADDRESSES } from "@/lib/blockchain";
import {
  LIKE_REGISTRY_ABI,
  MATCH_REGISTRY_ABI,
  PAYMENT_MANAGER_ABI,
} from "@/lib/abis";
import type { ContractState } from "@/lib/types";

export function useContractState(): {
  state: ContractState | null;
  isLoading: boolean;
  refetch: () => void;
} {
  const { address } = useAccount();

  const { data, isLoading, refetch } = useReadContracts({
    contracts: [
      {
        address: CONTRACT_ADDRESSES.likeRegistry,
        abi: LIKE_REGISTRY_ABI,
        functionName: "likeFee",
      },
      {
        address: CONTRACT_ADDRESSES.paymentManager,
        abi: PAYMENT_MANAGER_ABI,
        functionName: "swipeFee",
      },
      {
        address: CONTRACT_ADDRESSES.paymentManager,
        abi: PAYMENT_MANAGER_ABI,
        functionName: "messageFee",
      },
      {
        address: CONTRACT_ADDRESSES.paymentManager,
        abi: PAYMENT_MANAGER_ABI,
        functionName: "isPremium",
        args: address ? [address] : undefined,
      },
      {
        address: CONTRACT_ADDRESSES.paymentManager,
        abi: PAYMENT_MANAGER_ABI,
        functionName: "getMessageCredits",
        args: address ? [address] : undefined,
      },
      {
        address: CONTRACT_ADDRESSES.likeRegistry,
        abi: LIKE_REGISTRY_ABI,
        functionName: "getLikesCount",
      },
      {
        address: CONTRACT_ADDRESSES.matchRegistry,
        abi: MATCH_REGISTRY_ABI,
        functionName: "getMatchesCount",
      },
    ],
  });

  if (isLoading || !data) return { state: null, isLoading, refetch };

  const state: ContractState = {
    likeFee: (data[0]?.result as bigint) ?? 0n,
    swipeFee: (data[1]?.result as bigint) ?? 0n,
    messageFee: (data[2]?.result as bigint) ?? 0n,
    premiumFee: 0n,
    isPremium: (data[3]?.result as boolean) ?? false,
    messageCredits: Number((data[4]?.result as bigint) ?? 0n),
    totalLikes: Number((data[5]?.result as bigint) ?? 0n),
    totalMatches: Number((data[6]?.result as bigint) ?? 0n),
  };

  return { state, isLoading, refetch };
}

export function useHasLiked(fromHash?: `0x${string}`, toHash?: `0x${string}`) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.likeRegistry,
    abi: LIKE_REGISTRY_ABI,
    functionName: "hasLiked",
    args: fromHash && toHash ? [fromHash, toHash] : undefined,
    query: { enabled: !!fromHash && !!toHash },
  });
}

export function useIsMatch(
  user1Hash?: `0x${string}`,
  user2Hash?: `0x${string}`
) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.likeRegistry,
    abi: LIKE_REGISTRY_ABI,
    functionName: "isMatch",
    args: user1Hash && user2Hash ? [user1Hash, user2Hash] : undefined,
    query: { enabled: !!user1Hash && !!user2Hash },
  });
}

export function useUserMatches(userHash?: `0x${string}`) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.matchRegistry,
    abi: MATCH_REGISTRY_ABI,
    functionName: "getUserMatches",
    args: userHash ? [userHash] : undefined,
    query: { enabled: !!userHash },
  });
}
