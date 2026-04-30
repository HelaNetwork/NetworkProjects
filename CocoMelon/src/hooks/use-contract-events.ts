"use client";

import { useEffect } from "react";
import { usePublicClient } from "wagmi";
import { CONTRACT_ADDRESSES } from "@/lib/blockchain";
import { LIKE_REGISTRY_ABI, PAYMENT_MANAGER_ABI } from "@/lib/abis";
import { useAppStore } from "@/store/app-store";

export function useContractEvents() {
  const publicClient = usePublicClient();
  const addEvent = useAppStore((s) => s.addEvent);
  const addNotification = useAppStore((s) => s.addNotification);
  const identityHash = useAppStore((s) => s.identityHash);

  useEffect(() => {
    if (!publicClient || !identityHash) return;

    const unwatchLike = publicClient.watchContractEvent({
      address: CONTRACT_ADDRESSES.likeRegistry,
      abi: LIKE_REGISTRY_ABI,
      eventName: "LikeSubmitted",
      onLogs: (logs) => {
        for (const log of logs) {
          const args = log.args as {
            fromHash?: `0x${string}`;
            toHash?: `0x${string}`;
            proofHash?: `0x${string}`;
            timestamp?: bigint;
          };
          addEvent({
            type: "like",
            txHash: log.transactionHash || "0x",
            blockNumber: Number(log.blockNumber || 0),
            timestamp: Number(args.timestamp || 0) * 1000,
            data: {
              from: args.fromHash || "",
              to: args.toHash || "",
              proofHash: args.proofHash || "",
            },
          });

          if (args.toHash === identityHash) {
            addNotification({
              id: `like-${log.transactionHash}`,
              type: "like",
              title: "Someone Liked You",
              message: "A new like was submitted on-chain.",
              timestamp: Date.now(),
              read: false,
            });
          }
        }
      },
    });

    const unwatchMatch = publicClient.watchContractEvent({
      address: CONTRACT_ADDRESSES.likeRegistry,
      abi: LIKE_REGISTRY_ABI,
      eventName: "MatchCreated",
      onLogs: (logs) => {
        for (const log of logs) {
          const args = log.args as {
            user1?: `0x${string}`;
            user2?: `0x${string}`;
            timestamp?: bigint;
          };
          addEvent({
            type: "match",
            txHash: log.transactionHash || "0x",
            blockNumber: Number(log.blockNumber || 0),
            timestamp: Number(args.timestamp || 0) * 1000,
            data: {
              user1: args.user1 || "",
              user2: args.user2 || "",
            },
          });

          if (
            args.user1 === identityHash ||
            args.user2 === identityHash
          ) {
            addNotification({
              id: `match-${log.transactionHash}`,
              type: "match",
              title: "New Match!",
              message: "You have a new on-chain verified match.",
              timestamp: Date.now(),
              read: false,
            });
          }
        }
      },
    });

    const unwatchMsgProof = publicClient.watchContractEvent({
      address: CONTRACT_ADDRESSES.paymentManager,
      abi: PAYMENT_MANAGER_ABI,
      eventName: "MessageProofStored",
      onLogs: (logs) => {
        for (const log of logs) {
          const args = log.args as {
            matchHash?: `0x${string}`;
            messageHash?: `0x${string}`;
            timestamp?: bigint;
          };
          addEvent({
            type: "message_proof",
            txHash: log.transactionHash || "0x",
            blockNumber: Number(log.blockNumber || 0),
            timestamp: Number(args.timestamp || 0) * 1000,
            data: {
              matchHash: args.matchHash || "",
              messageHash: args.messageHash || "",
            },
          });
        }
      },
    });

    return () => {
      unwatchLike();
      unwatchMatch();
      unwatchMsgProof();
    };
  }, [publicClient, identityHash, addEvent, addNotification]);
}
