import { useState, useEffect } from "react";
import "../styles/globals.css";
import { connectWallet, getConnectedWallet } from "../lib/web3";

export default function App({ Component, pageProps }) {
  const [walletAddress, setWalletAddress] = useState(null);

  // On load — check if already connected
  useEffect(() => {
    getConnectedWallet().then((addr) => {
      if (addr) setWalletAddress(addr);
    });

    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        setWalletAddress(accounts[0] || null);
      });
    }
  }, []);

  async function handleConnect() {
    try {
      const addr = await connectWallet();
      setWalletAddress(addr);
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <Component
      {...pageProps}
      walletAddress={walletAddress}
      onConnect={handleConnect}
    />
  );
}
