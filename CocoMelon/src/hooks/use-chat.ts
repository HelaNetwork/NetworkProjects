"use client";

import { useCallback, useState, useMemo } from "react";
import { useAppStore } from "@/store/app-store";
import {
  encryptMessage,
  decryptMessage,
  generateSharedSecret,
} from "@/lib/encryption";
import { generateMessageProofHash } from "@/lib/zk";
import { useWriteContract, usePublicClient, useAccount } from "wagmi";
import { CONTRACT_ADDRESSES } from "@/lib/blockchain";
import { PAYMENT_MANAGER_ABI } from "@/lib/abis";
import type { ChatMessage } from "@/lib/types";

export function useChat(matchId: string) {
  const { address } = useAccount();
  const messages = useAppStore((s) => s.messages);
  const addMessage = useAppStore((s) => s.addMessage);
  const addEvent = useAppStore((s) => s.addEvent);
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();
  const [isSending, setIsSending] = useState(false);
  const [txError, setTxError] = useState<string | null>(null);

  const chatMessages = useMemo(
    () => messages[matchId] || [],
    [messages, matchId]
  );

  const sendMessage = useCallback(
    async (content: string, recipientAddress: string) => {
      if (!address || !content.trim() || !publicClient) return;

      setIsSending(true);
      setTxError(null);

      try {
        // 1. Encrypt message client-side
        const sharedSecret = generateSharedSecret(address, recipientAddress);
        const encrypted = await encryptMessage(content, sharedSecret);

        // 2. Generate cryptographic proof hash
        const proofHash = generateMessageProofHash(
          matchId,
          content,
          address
        );

        // 3. Store proof on Hela Chain
        const tx = await writeContractAsync({
          address: CONTRACT_ADDRESSES.paymentManager,
          abi: PAYMENT_MANAGER_ABI,
          functionName: "storeMessageProof",
          args: [matchId as `0x${string}`, proofHash],
        });

        // 4. Wait for confirmation
        const receipt = await publicClient.waitForTransactionReceipt({
          hash: tx,
        });

        // 5. Cache the message locally (content is encrypted)
        const message: ChatMessage = {
          id: `msg-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          matchId,
          senderHash: address,
          content: encrypted,
          encrypted: true,
          timestamp: Date.now(),
          proofHash,
          txHash: tx,
        };

        addMessage(matchId, message);

        addEvent({
          type: "message_proof",
          txHash: tx,
          blockNumber: Number(receipt.blockNumber),
          timestamp: Date.now(),
          data: {
            matchId,
            messageHash: proofHash,
          },
        });
      } catch (error) {
        const msg =
          error instanceof Error ? error.message : "Failed to send";
        setTxError(msg);
        console.error("Hela storeMessageProof failed:", error);
      } finally {
        setIsSending(false);
      }
    },
    [address, matchId, addMessage, addEvent, writeContractAsync, publicClient]
  );

  const getDecryptedMessages = useCallback(
    async (
      recipientAddress: string
    ): Promise<(ChatMessage & { decrypted: string })[]> => {
      if (!address) return [];
      const sharedSecret = generateSharedSecret(address, recipientAddress);

      const decrypted = await Promise.all(
        chatMessages.map(async (msg) => {
          try {
            const text = msg.encrypted
              ? await decryptMessage(msg.content, sharedSecret)
              : msg.content;
            return { ...msg, decrypted: text };
          } catch {
            return { ...msg, decrypted: "[Decryption failed]" };
          }
        })
      );

      return decrypted;
    },
    [address, chatMessages]
  );

  return {
    chatMessages,
    sendMessage,
    getDecryptedMessages,
    isSending,
    txError,
  };
}
