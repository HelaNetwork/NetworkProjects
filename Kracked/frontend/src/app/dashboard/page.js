"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ethers } from "ethers";
import {
  getContract,
  ensureHelaNetwork,
  addHelaNetwork,
} from "@/utils/contract";
import ThemeToggle from "@/components/ThemeToggle";
import Link from "next/link";

export default function Dashboard() {
  const router = useRouter();
  const [connecting, setConnecting] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  const connectAndRoute = async (role) => {
    setSelectedRole(role);
    setConnecting(true);

    if (typeof window.ethereum === "undefined") {
      alert("Please install MetaMask or HeLa Wallet!");
      setConnecting(false);
      setSelectedRole(null);
      return;
    }
    try {
      await ensureHelaNetwork();
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      if (role === "hr") {
        try {
          const contract = await getContract(provider);
          const owner = await contract.owner();
          if (owner.toLowerCase() !== address.toLowerCase()) {
            console.warn("Connected wallet is not the contract owner");
          }
        } catch (e) {
          console.log("Could not verify owner, proceeding anyway");
        }
        router.push("/dashboard/hr");
      } else {
        router.push("/dashboard/employee");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to connect wallet. Make sure you're on HeLa Testnet.");
    } finally {
      setConnecting(false);
      setSelectedRole(null);
    }
  };

  const handleAddNetwork = async () => {
    if (typeof window.ethereum === "undefined") {
      alert("Please install MetaMask or HeLa Wallet first!");
      return;
    }
    try {
      await addHelaNetwork();
      alert("HeLa Testnet added to your wallet!");
    } catch (e) {
      alert("Failed to add network: " + e.message);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden"
      style={{ background: "var(--gradient-hero)" }}
    >
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-10 blur-3xl"
          style={{ background: "var(--accent)" }}
        />
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full opacity-10 blur-3xl"
          style={{ background: "var(--accent-secondary)" }}
        />
      </div>

      <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-20">
        <Link
          href="/"
          className="text-sm opacity-60 hover:opacity-100 transition-opacity"
          style={{ color: "var(--text-secondary)" }}
        >
          ← Back
        </Link>
        <div className="flex items-center gap-3">
          <button
            onClick={handleAddNetwork}
            className="px-3 py-1.5 text-xs rounded-lg font-medium transition-all hover:scale-105"
            style={{
              background: "var(--accent-light)",
              color: "var(--accent)",
              border: "1px solid var(--border)",
            }}
          >
            Add HeLa Network
          </button>
          <ThemeToggle />
        </div>
      </div>

      <div className="text-center mb-12 z-10">
        <h1
          className="text-4xl font-bold mb-3"
          style={{ color: "var(--text-primary)" }}
        >
          Select Your Role
        </h1>
        <p
          className="text-lg opacity-80"
          style={{ color: "var(--text-secondary)" }}
        >
          Connect your HeLa wallet to access your dashboard
        </p>
        <div
          className="mt-3 px-4 py-1.5 rounded-full text-xs inline-block"
          style={{
            background: "var(--card-bg)",
            border: "1px solid var(--border)",
            color: "var(--text-secondary)",
          }}
        >
          HeLa Testnet • Chain ID 666888
        </div>
      </div>

      <div className="flex gap-6 z-10 flex-wrap justify-center">
        <button
          onClick={() => connectAndRoute("hr")}
          disabled={connecting}
          className="group relative w-72 p-8 rounded-2xl text-left transition-all duration-300 hover:scale-105 hover:shadow-2xl disabled:opacity-60"
          style={{
            background: "var(--card-bg)",
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-lg)",
          }}
        >
          <div className="text-4xl mb-4"></div>
          <h2
            className="text-xl font-bold mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            HR / Admin
          </h2>
          <p
            className="text-sm mb-6 leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            Manage treasury, create salary streams, handle taxes and bonuses
          </p>
          <div
            className="flex items-center gap-2 text-sm font-semibold"
            style={{ color: "var(--accent)" }}
          >
            {connecting && selectedRole === "hr" ? (
              <>Connecting...</>
            ) : (
              <>Connect as HR →</>
            )}
          </div>
        </button>

        <button
          onClick={() => connectAndRoute("employee")}
          disabled={connecting}
          className="group relative w-72 p-8 rounded-2xl text-left transition-all duration-300 hover:scale-105 hover:shadow-2xl disabled:opacity-60"
          style={{
            background: "var(--card-bg)",
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-lg)",
          }}
        >
          <div className="text-4xl mb-4"></div>
          <h2
            className="text-xl font-bold mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            Employee
          </h2>
          <p
            className="text-sm mb-6 leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            View earnings, withdraw salary, track investments and analytics
          </p>
          <div
            className="flex items-center gap-2 text-sm font-semibold"
            style={{ color: "var(--accent)" }}
          >
            {connecting && selectedRole === "employee" ? (
              <>Connecting...</>
            ) : (
              <>Connect as Employee →</>
            )}
          </div>
        </button>
      </div>

      <p
        className="mt-8 text-xs opacity-50 z-10"
        style={{ color: "var(--text-secondary)" }}
      >
        Powered by PayStream on HeLa Chain
      </p>
    </div>
  );
}
