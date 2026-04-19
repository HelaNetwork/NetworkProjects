"use client";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import {
  connectWallet as connectWalletUtil,
  ensureHelaNetwork,
  CHAIN_ID,
} from "@/utils/contract";

export default function ConnectWallet({ onConnect }) {
  const [walletAddress, setWalletAddress] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [wrongNetwork, setWrongNetwork] = useState(false);

  const connectWallet = async () => {
    if (typeof window.ethereum === "undefined") {
      alert("Please install MetaMask!");
      return;
    }
    setConnecting(true);
    try {
      const { signer, address } = await connectWalletUtil();

      const chainIdHex = await window.ethereum.request({
        method: "eth_chainId",
      });
      const currentChainId = parseInt(chainIdHex, 16);
      if (currentChainId !== CHAIN_ID) {
        setWrongNetwork(true);
        await ensureHelaNetwork();
      }
      setWrongNetwork(false);
      setWalletAddress(address);
      if (onConnect) onConnect(signer, address);
    } catch (err) {
      console.error("Connection failed:", err);
    } finally {
      setConnecting(false);
    }
  };

  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      window.ethereum.on("accountsChanged", () => window.location.reload());
      window.ethereum.on("chainChanged", (chainIdHex) => {
        const newChainId = parseInt(chainIdHex, 16);
        if (newChainId !== CHAIN_ID) {
          setWrongNetwork(true);
        } else {
          setWrongNetwork(false);
        }
        window.location.reload();
      });
    }
  }, []);

  if (wrongNetwork) {
    return (
      <button
        onClick={connectWallet}
        className="relative group bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-semibold py-2.5 px-6 rounded-xl transition-all duration-300 shadow-lg"
      >
        Wrong Network - Switch to HeLa
      </button>
    );
  }

  if (walletAddress) {
    return (
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        <span className="font-mono text-sm bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
          {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
        </span>
      </div>
    );
  }

  return (
    <button
      onClick={connectWallet}
      disabled={connecting}
      className="relative group bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold py-2.5 px-6 rounded-xl transition-all duration-300 shadow-lg shadow-purple-900/40 hover:shadow-purple-900/60 disabled:opacity-50"
    >
      <span className="relative z-10">
        {connecting ? "Connecting..." : "Connect MetaMask"}
      </span>
    </button>
  );
}
