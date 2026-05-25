'use client';

import Game from "@/components/Game";
import { useAuth } from "@/contexts/AuthContext";
import { useAccount } from 'wagmi';

export default function Home() {
  const { user, loading } = useAuth();
  const { address } = useAccount();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
        <p className="text-gray-500 text-lg">Please sign in to continue</p>
      </div>
    );
  }

  return (
    <div className="pt-8">
      <Game userId={user.uid} walletAddress={address || ""} />
    </div>
  );
}
