import { useState, useCallback, useEffect } from "react";
import { BrowserProvider, JsonRpcProvider, Contract, formatEther } from "ethers";
import { CONTRACTS, HELA_CHAIN, HUSD_ABI } from "./config";

// Lazy fallback provider — created on first use, not at module load
let _fallback = null;
function getFallbackProvider() {
  if (!_fallback) {
    try {
      _fallback = new JsonRpcProvider("https://testnet-rpc.helachain.com", 666888);
    } catch (e) {
      console.warn("Failed to create fallback provider:", e);
      return null;
    }
  }
  return _fallback;
}

export function useWallet() {
  const [account, setAccount] = useState(null);
  const [walletProvider, setWalletProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [balance, setBalance] = useState(null);
  const [chainOk, setChainOk] = useState(false);
  const [readProvider, setReadProvider] = useState(null);

  // Ensure we always have a read-only provider available
  useEffect(() => {
    if (!walletProvider) {
      const fb = getFallbackProvider();
      setReadProvider(fb);
    } else {
      setReadProvider(walletProvider);
    }
  }, [walletProvider]);

  const provider = readProvider;

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask to use StealthCheckout.");
      return;
    }

    try {
      const prov = new BrowserProvider(window.ethereum);
      const accounts = await prov.send("eth_requestAccounts", []);
      const s = await prov.getSigner();

      setWalletProvider(prov);
      setSigner(s);
      setAccount(accounts[0]);

      // Get HUSD balance
      try {
        const husd = new Contract(CONTRACTS.HUSD, HUSD_ABI, prov);
        const bal = await husd.balanceOf(accounts[0]);
        setBalance(formatEther(bal));
      } catch {
        setBalance("0");
      }

      // Switch to HeLa
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: HELA_CHAIN.chainId }],
        });
        setChainOk(true);
      } catch (switchErr) {
        if (switchErr.code === 4902) {
          try {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [HELA_CHAIN],
            });
            setChainOk(true);
          } catch (e) {
            console.error("Failed to add chain", e);
          }
        }
      }
    } catch (err) {
      console.error("Wallet connect error:", err);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAccount(null);
    setWalletProvider(null);
    setSigner(null);
    setBalance(null);
  }, []);

  return { account, provider, signer, balance, chainOk, connect, disconnect };
}
