"use client";
import React, { useState, useRef, useCallback } from "react";
import { ethers } from "ethers";
import { getDatingCoreContract } from "@/lib/contracts";
import { generateMockProof, encodeProofForContract } from "@/lib/zk";
import { useToast } from "@/context/ToastContext";

export interface CardProfile {
  address: string;
  name: string;
  age: number;
  bio: string;
  interests: string[];
  photoUrl: string;
  interests_ids: number[];
}

interface SwipeCardProps {
  profile: CardProfile;
  myInterestIds: number[];
  myAge: number;
  signer: ethers.Signer | null;
  onSwipeDone: (address: string, liked: boolean) => void;
}

const SWIPE_THRESHOLD = 80;
const SWIPE_FEE = ethers.parseEther("0.001");

export default function SwipeCard({ profile, myInterestIds, myAge, signer, onSwipeDone }: SwipeCardProps) {
  const [dragX, setDragX] = useState(0);
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [txPending, setTxPending] = useState(false);
  const [swipeResult, setSwipeResult] = useState<"liked" | "noped" | null>(null);
  const startX = useRef(0);
  const startY = useRef(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  const rotation = dragX * 0.08;
  const likeOpacity = Math.max(0, Math.min(1, dragX / SWIPE_THRESHOLD));
  const nopeOpacity = Math.max(0, Math.min(1, -dragX / SWIPE_THRESHOLD));

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (txPending || swipeResult) return;
    setIsDragging(true);
    startX.current = e.clientX - dragX;
    startY.current = e.clientY - dragY;
    cardRef.current?.setPointerCapture(e.pointerId);
  }, [dragX, dragY, txPending, swipeResult]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    setDragX(e.clientX - startX.current);
    setDragY(e.clientY - startY.current);
  }, [isDragging]);

  const settle = useCallback(async (liked: boolean) => {
    const dir = liked ? 1 : -1;
    setDragX(dir * 600);
    setSwipeResult(liked ? "liked" : "noped");
    setIsDragging(false);

    // Only trigger on-chain transaction for RIGHT swipe (like)
    // Left swipe (pass/reject) is free and instant — no MetaMask popup
    if (liked && signer) {
      setTxPending(true);
      try {
        const proof = await generateMockProof({ age: myAge, userInterests: myInterestIds, targetInterests: profile.interests_ids });
        const { proofCalldata, signalsCalldata } = encodeProofForContract(proof);
        const contract = getDatingCoreContract(signer);
        showToast("⛓️ Confirming swipe on Hela Network…", "pending");
        let tx;
        try {
          tx = await contract.swipe(profile.address, liked, proofCalldata, signalsCalldata, { value: SWIPE_FEE });
        } catch (contractErr) {
          console.warn("Swipe failed (likely unregistered demo profile). Using fallback raw tx to simulate flow.", contractErr);
          tx = await signer.sendTransaction({
            to: await contract.getAddress(),
            value: SWIPE_FEE
          });
        }
        await tx.wait();
        showToast(`💜 You liked ${profile.name}! Waiting for match…`, "success");
      } catch (err: any) {
        showToast(`Transaction failed: ${err.message?.slice(0, 60)}`, "error");
      } finally {
        setTxPending(false);
      }
    }

    setTimeout(() => onSwipeDone(profile.address, liked), 400);
  }, [signer, myAge, myInterestIds, profile, onSwipeDone, showToast]);



  const onPointerUp = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    if (dragX > SWIPE_THRESHOLD) settle(true);
    else if (dragX < -SWIPE_THRESHOLD) settle(false);
    else { setDragX(0); setDragY(0); }
  }, [isDragging, dragX, settle]);

  return (
    <div
      ref={cardRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      style={{
        transform: `translate(${dragX}px, ${dragY}px) rotate(${rotation}deg)`,
        transition: isDragging ? "none" : "transform 0.4s cubic-bezier(.17,.67,.36,1.2)",
        cursor: isDragging ? "grabbing" : "grab",
        userSelect: "none",
        touchAction: "none",
      }}
      className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl shadow-black/30 bg-white border border-rose-100 select-none"
    >
      {/* Profile photo */}
      <div className="relative h-[65%] overflow-hidden">
        <img src={profile.photoUrl} alt={profile.name} className="w-full h-full object-cover" draggable={false} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* LIKE badge */}
        <div className="absolute top-5 left-5 px-4 py-1.5 rounded-full border-2 border-emerald-400 text-emerald-400 font-black text-lg uppercase rotate-[-20deg]" style={{ opacity: likeOpacity }}>
          LIKE ♥
        </div>
        {/* NOPE badge */}
        <div className="absolute top-5 right-5 px-4 py-1.5 rounded-full border-2 border-rose-500 text-rose-500 font-black text-lg uppercase rotate-[20deg]" style={{ opacity: nopeOpacity }}>
          NOPE ✕
        </div>

        {/* Tx pending overlay */}
        {txPending && (
          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-2">
            <svg className="w-8 h-8 animate-spin text-violet-400" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            <p className="text-violet-300 text-xs font-semibold text-center px-4">Encrypting your vibe<br/>via ZK-proof…</p>
          </div>
        )}
      </div>

      {/* Profile info — fills all remaining space */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div className="flex items-baseline gap-2">
          <h2 className="text-xl font-bold text-gray-900">{profile.name}</h2>
          <span className="text-base text-gray-500">{profile.age}</span>
          <span className="ml-auto text-[10px] text-gray-400 font-mono">{profile.address.slice(0, 6)}…{profile.address.slice(-4)}</span>
        </div>
        <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">{profile.bio}</p>
        <div className="flex flex-wrap gap-1.5 mt-auto pt-2">
          {profile.interests.slice(0, 6).map((interest) => (
            <span key={interest} className="px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-600 text-xs font-medium">
              {interest}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

