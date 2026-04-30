"use client";

import { useCallback, useState } from "react";
import { useAppStore } from "@/store/app-store";
import { generateLikeCommitment, verifyCommitment } from "@/lib/zk";
import { useWriteContract, usePublicClient, useAccount } from "wagmi";
import { CONTRACT_ADDRESSES } from "@/lib/blockchain";
import { LIKE_REGISTRY_ABI } from "@/lib/abis";
import type { UserProfile } from "@/lib/types";

export function useSwipe() {
  const { address } = useAccount();
  const {
    identityHash,
    profiles,
    swipeIndex,
    addLike,
    nextSwipe,
    addEvent,
    setLoading,
  } = useAppStore();

  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();
  const [lastAction, setLastAction] = useState<"like" | "pass" | null>(null);
  const [txError, setTxError] = useState<string | null>(null);

  const currentProfile: UserProfile | null =
    profiles.length > 0 && swipeIndex < profiles.length
      ? profiles[swipeIndex]
      : null;

  const hasMoreProfiles = swipeIndex < profiles.length;

  const handleLike = useCallback(async () => {
    if (!currentProfile || !address || !identityHash || !publicClient) return;

    setLoading(true);
    setLastAction("like");
    setTxError(null);

    try {
      // 1. Generate cryptographic commitment
      const commitment = generateLikeCommitment(address, currentProfile.address);

      // 2. Verify commitment locally before sending
      if (!verifyCommitment(commitment)) {
        throw new Error("Commitment verification failed");
      }

      // 3. Read the current fee from the contract
      const fee = await publicClient.readContract({
        address: CONTRACT_ADDRESSES.likeRegistry,
        abi: LIKE_REGISTRY_ABI,
        functionName: "likeFee",
      });

      // 4. Submit like to Hela Chain
      const tx = await writeContractAsync({
        address: CONTRACT_ADDRESSES.likeRegistry,
        abi: LIKE_REGISTRY_ABI,
        functionName: "submitLike",
        args: [
          commitment.fromHash,
          commitment.toHash,
          commitment.commitmentHash,
        ],
        value: fee as bigint,
      });

      // 5. Wait for on-chain confirmation
      const receipt = await publicClient.waitForTransactionReceipt({ hash: tx });

      // 6. Cache the like locally
      addLike(currentProfile.identityHash);
      addEvent({
        type: "like",
        txHash: tx,
        blockNumber: Number(receipt.blockNumber),
        timestamp: Date.now(),
        data: {
          from: commitment.fromHash,
          to: commitment.toHash,
          commitmentHash: commitment.commitmentHash,
        },
      });

      // 7. Check if mutual match exists on-chain
      const isMutual = await publicClient.readContract({
        address: CONTRACT_ADDRESSES.likeRegistry,
        abi: LIKE_REGISTRY_ABI,
        functionName: "isMatch",
        args: [commitment.fromHash, commitment.toHash],
      });

      if (isMutual) {
        addEvent({
          type: "match",
          txHash: tx,
          blockNumber: Number(receipt.blockNumber),
          timestamp: Date.now(),
          data: {
            user1: commitment.fromHash,
            user2: commitment.toHash,
          },
        });
      }

      nextSwipe();
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Transaction rejected";
      setTxError(msg);
      console.error("Hela submitLike failed:", error);
    } finally {
      setLoading(false);
    }
  }, [
    currentProfile,
    address,
    identityHash,
    publicClient,
    writeContractAsync,
    addLike,
    addEvent,
    nextSwipe,
    setLoading,
  ]);

  const handlePass = useCallback(() => {
    setLastAction("pass");
    nextSwipe();
  }, [nextSwipe]);

  return {
    currentProfile,
    hasMoreProfiles,
    lastAction,
    txError,
    likedProfiles: useAppStore.getState().likedProfiles,
    handleLike,
    handlePass,
    isLoading: useAppStore.getState().isLoading,
  };
}
