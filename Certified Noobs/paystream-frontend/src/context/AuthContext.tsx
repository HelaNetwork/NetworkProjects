"use client";

import { createContext, useContext, ReactNode, useEffect, useState } from "react";
import { useAccount, useReadContract } from "wagmi";
import { NativePayStreamABI } from "@/abis/NativePayStream";
import { PAYSTREAM_ADDRESS } from "@/config/wagmi";

export type AuthRole = "hr" | "employee" | null;

type AuthContextType = {
  role: AuthRole;
  loading: boolean;
  isLoggedIn: boolean; // Alias for isConnected
  address: `0x${string}` | undefined;
  signOut: () => void; // Keeping strictly for compatibility, though ConnectButton handles disconnect
  user: null; // Deprecated, keeping null to avoid breaking changes if accessed elsewhere
};

const AuthContext = createContext<AuthContextType>({
  role: null,
  loading: true,
  isLoggedIn: false,
  address: undefined,
  signOut: () => { },
  user: null,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const { address, isConnected, isConnecting, isReconnecting } = useAccount();
  const [role, setRole] = useState<AuthRole>(null);

  // Check if connected address is owner
  const { data: owner } = useReadContract({
    address: PAYSTREAM_ADDRESS,
    abi: NativePayStreamABI,
    functionName: "owner",
    query: {
      enabled: isConnected && !!address,
    }
  });

  // Check if connected address is HR
  const { data: isHR } = useReadContract({
    address: PAYSTREAM_ADDRESS,
    abi: NativePayStreamABI,
    functionName: "isHR",
    args: address ? [address] : undefined,
    query: {
      enabled: isConnected && !!address,
    }
  });

  useEffect(() => {
    if (!isConnected || !address) {
      setRole(null);
      return;
    }

    const isOwner = owner && typeof owner === 'string' && owner.toLowerCase() === address.toLowerCase();
    const isHr = isHR === true;

    if (isOwner || isHr) {
      setRole("hr");
    } else {
      setRole("employee");
    }
  }, [isConnected, address, owner, isHR]);

  const loading = isConnecting || isReconnecting;

  return (
    <AuthContext.Provider
      value={{
        role,
        loading,
        isLoggedIn: isConnected,
        address,
        signOut: () => { }, // No-op, use ConnectButton to disconnect
        user: null,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
