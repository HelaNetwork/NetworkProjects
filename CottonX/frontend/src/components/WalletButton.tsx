"use client";

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Button } from './ui/button'; // assuming shadcn ui is used
import { cn } from '@/lib/utils';

export function WalletButton() {
  const { address, isConnected } = useAccount();
  const { connectors, connect } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected && address) {
    return (
      <Button 
        variant="outline" 
        onClick={() => disconnect()}
        className="font-mono bg-white/5 border-white/10 hover:bg-white/10 text-white"
      >
        {address.substring(0, 6)}...{address.substring(address.length - 4)}
      </Button>
    );
  }

  return (
    <Button 
      variant="default"
      onClick={() => connect({ connector: connectors[0] })}
      className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
    >
      Connect Wallet
    </Button>
  );
}
