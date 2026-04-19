"use client";
import React from "react";

interface MatchCardProps {
  address: string;
  name: string;
  photoUrl: string;
  lastMessage?: string;
  onClick: () => void;
}

export default function MatchCard({ address, name, photoUrl, lastMessage, onClick }: MatchCardProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-4 w-full p-4 rounded-2xl bg-white/80 border border-gray-300 hover:border-rose-500/40 hover:bg-white/60/60 transition-all group"
    >
      {/* Avatar */}
      <div className="relative w-14 h-14 rounded-2xl overflow-hidden shrink-0">
        <img src={photoUrl} alt={name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 ring-2 ring-violet-500/30 rounded-2xl group-hover:ring-violet-500/60 transition" />
      </div>
      {/* Info */}
      <div className="flex flex-col text-left min-w-0">
        <span className="text-gray-900 font-semibold text-sm truncate">{name}</span>
        <span className="text-gray-500 text-xs font-mono truncate">{address.slice(0,8)}…{address.slice(-6)}</span>
        {lastMessage && (
          <span className="text-gray-600 text-xs truncate mt-0.5">{lastMessage}</span>
        )}
      </div>
      {/* Arrow */}
      <div className="ml-auto text-gray-600 group-hover:text-rose-500 transition text-lg shrink-0">→</div>
    </button>
  );
}



