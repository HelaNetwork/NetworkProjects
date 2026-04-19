import React, { useEffect, useState } from "react";
import { getTreasury, depositTreasury, withdrawTreasury, getBlockchainConfig } from "../../app/api";
import { loginAndConnectContract, logoutWeb3Auth, isConnected, getConnectedAddress } from "../../blockchain/web3Auth";
import { ethers } from "ethers";
import { HELA_CHAIN_CONFIG, CORE_PAYROLL_ABI } from "../../blockchain/config";

export default function Treasury() {
  const [treasury, setTreasury] = useState<any>(null);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [onChainAmount, setOnChainAmount] = useState("");
  const [onChainLoading, setOnChainLoading] = useState(false);
  const [connectLoading, setConnectLoading] = useState(false);
  const [contractAddress, setContractAddress] = useState<string | null>(null);
  const [taxRate, setTaxRate] = useState<number | null>(null);
  const [taxVault, setTaxVault] = useState<string | null>(null);
  const [emergencyLoading, setEmergencyLoading] = useState(false);
  const HELA_EXPLORER_TX = (import.meta as any).env?.VITE_HELA_EXPLORER_TX || "";
  const HELA_EXPLORER_ADDRESS = (import.meta as any).env?.VITE_HELA_EXPLORER_ADDRESS || "";
  const HELA_TESTNET_WEBSITE = (import.meta as any).env?.VITE_HELA_TESTNET_WEBSITE || "";

  useEffect(() => {
    loadTreasury();
    loadBlockchainConfig();
    if (isConnected()) {
      getConnectedAddress().then((addr) => setWalletAddress(addr));
    }
  }, []);

  async function loadBlockchainConfig() {
    try {
      const cfg = await getBlockchainConfig();
      const addr = (cfg?.contract_address || "").trim();
      const zeroAddr = "0x0000000000000000000000000000000000000000";
      if (addr && addr.toLowerCase() !== zeroAddr.toLowerCase()) {
        setContractAddress(addr);
      }
    } catch {
      // Not critical - on-chain features disabled
    }
  }

  useEffect(() => {
    async function loadTaxInfo() {
      if (!contractAddress) {
        setTaxRate(null);
        setTaxVault(null);
        return;
      }
      try {
        const provider = new ethers.JsonRpcProvider(HELA_CHAIN_CONFIG.rpcTarget);
        const roContract = new ethers.Contract(contractAddress, CORE_PAYROLL_ABI, provider);
        const [rate, vault] = await Promise.all([
          roContract.TAX_RATE?.().catch(() => null),
          roContract.taxVault?.().catch(() => null),
        ]);
        if (rate !== null && rate !== undefined) setTaxRate(Number(rate));
        if (vault) setTaxVault(String(vault));
      } catch {
        setTaxRate(null);
        setTaxVault(null);
      }
    }
    loadTaxInfo();
  }, [contractAddress]);

  async function loadTreasury() {
    try {
      const data = await getTreasury();
      setTreasury(data);
    } catch (err: any) {
      alert(err.message);
    }
  }

  async function handleDeposit() {
    if (!amount) return;

    try {
      setLoading(true);
      await depositTreasury(Number(amount));
      setAmount("");
      await loadTreasury();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleWithdraw() {
    if (!amount) return;

    try {
      setLoading(true);
      await withdrawTreasury(Number(amount));
      setAmount("");
      await loadTreasury();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleConnectWallet() {
    if (!contractAddress) {
      alert("Contract not configured. Set CONTRACT_ADDRESS in backend .env");
      return;
    }
    try {
      setConnectLoading(true);
      const { address } = await loginAndConnectContract(contractAddress);
      setWalletAddress(address);
    } catch (err: any) {
      alert(err?.message || "Failed to connect wallet");
    } finally {
      setConnectLoading(false);
    }
  }

  async function handleDisconnectWallet() {
    await logoutWeb3Auth();
    setWalletAddress(null);
  }

  async function handleOnChainDeposit() {
    if (!onChainAmount || !contractAddress) return;
    try {
      setOnChainLoading(true);
      const { contract, signer } = await loginAndConnectContract(contractAddress);
      const valueWei = ethers.parseEther(onChainAmount);
      const tx = await signer.sendTransaction({
        to: contractAddress,
        value: valueWei,
      });
      await tx.wait();
      setOnChainAmount("");
      setWalletAddress(await signer.getAddress());
      await loadTreasury();
    } catch (err: any) {
      alert(err?.message || "On-chain deposit failed");
    } finally {
      setOnChainLoading(false);
    }
  }

  async function handleEmergencyWithdraw() {
    if (!contractAddress) return;
    if (!confirm("Withdraw the entire contract treasury to the employer wallet?")) return;
    try {
      setEmergencyLoading(true);
      const { contract } = await loginAndConnectContract(contractAddress);
      const tx = await contract.emergencyWithdraw();
      await tx.wait();
      await loadTreasury();
      alert("Emergency withdrawal completed");
    } catch (err: any) {
      alert(err?.message || "Emergency withdrawal failed");
    } finally {
      setEmergencyLoading(false);
    }
  }

  if (!treasury) {
    return <div className="p-10">Loading treasury...</div>;
  }

  return (
    <div className="space-y-8 p-8">

      <h1 className="text-2xl font-bold">Treasury Overview</h1>

      {/* Balance Cards */}
      <div className="grid md:grid-cols-2 gap-6">

        <div className="bg-white shadow rounded-xl p-6">
          <p className="text-gray-500">Web2 Balance</p>
          <h2 className="text-3xl font-semibold text-emerald-600">
            ₹ {Number(treasury.total_balance).toFixed(2)}
          </h2>
        </div>

        <div className="bg-white shadow rounded-xl p-6">
          <p className="text-gray-500">On-Chain Balance</p>
          <h2 className="text-3xl font-semibold text-blue-600">
            ₹ {Number(treasury.onchain_balance).toFixed(2)}
          </h2>
        </div>

      </div>

      {/* Web3Auth Connect Wallet + On-Chain Deposit */}
      {contractAddress && (
        <div className="bg-white shadow rounded-xl p-6 space-y-4">
          <h3 className="text-lg font-semibold">On-Chain Treasury (HeLa Testnet)</h3>
          <p className="text-sm text-gray-500">
            Connect via Web3Auth (Email, Google) to deposit HLUSD to the CorePayroll contract.
          </p>
          {(taxRate !== null || taxVault) && (
            <div className="text-xs text-gray-600">
              {taxRate !== null && <p>Contract Tax Rate: {taxRate}%</p>}
              {taxVault && <p>Tax Vault: {taxVault.slice(0, 8)}...{taxVault.slice(-6)}</p>}
            </div>
          )}
          {!walletAddress ? (
            <button
              onClick={handleConnectWallet}
              disabled={connectLoading}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {connectLoading ? "Connecting…" : "Connect Wallet (Web3Auth)"}
            </button>
          ) : (
            <>
              <p className="text-sm text-gray-600">
                Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </p>
              <button
                onClick={handleDisconnectWallet}
                className="text-sm text-gray-500 hover:underline"
              >
                Disconnect
              </button>
              <div className="flex gap-2 items-end mt-2">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Amount (HLUSD)</label>
                  <input
                    type="text"
                    placeholder="0.1"
                    value={onChainAmount}
                    onChange={(e) => setOnChainAmount(e.target.value)}
                    className="border px-4 py-2 rounded w-40"
                  />
                </div>
                <button
                  onClick={handleOnChainDeposit}
                  disabled={!onChainAmount || onChainLoading}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  {onChainLoading ? "Depositing..." : "Deposit to Contract"}
                </button>
                <button
                  onClick={handleEmergencyWithdraw}
                  disabled={emergencyLoading}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {emergencyLoading ? "Withdrawing..." : "Emergency Withdraw"}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Sync Info */}
      <div className="bg-white shadow rounded-xl p-6 space-y-2">
        <p className="text-gray-500">Last Transaction Hash</p>
        {treasury.last_tx_hash ? (
          <a
            href={HELA_EXPLORER_TX ? `${HELA_EXPLORER_TX}${treasury.last_tx_hash}` : "#"}
            target="_blank"
            rel="noopener noreferrer"
            className={`text-sm break-all ${HELA_EXPLORER_TX ? "text-blue-600 hover:underline" : "text-purple-600"}`}
            title={HELA_EXPLORER_TX ? "View on HeLa Explorer" : ""}
          >
            {treasury.last_tx_hash}
          </a>
        ) : (
          <p className="text-sm break-all text-purple-600">No transaction yet</p>
        )}

        <p className="text-gray-500 mt-4">Last Synced</p>
        <p>
          {treasury.last_synced_at
            ? new Date(treasury.last_synced_at).toLocaleString()
            : "Not synced yet"}
        </p>
        {contractAddress && (
          <div className="mt-4 flex gap-3 items-center">
            <a
              href={HELA_EXPLORER_ADDRESS ? `${HELA_EXPLORER_ADDRESS}${contractAddress}` : "#"}
              target="_blank"
              rel="noopener noreferrer"
              className={`px-3 py-2 rounded-lg text-sm ${
                HELA_EXPLORER_ADDRESS
                  ? "bg-indigo-600 text-white hover:bg-indigo-700"
                  : "bg-gray-100 text-gray-500 cursor-not-allowed"
              }`}
            >
              {HELA_EXPLORER_ADDRESS ? "View Contract on HeLa Explorer" : "Set VITE_HELA_EXPLORER_ADDRESS"}
            </a>
            {HELA_TESTNET_WEBSITE && (
              <a
                href={HELA_TESTNET_WEBSITE}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 rounded-lg text-sm bg-purple-600 text-white hover:bg-purple-700"
              >
                Open HeLa Testnet
              </a>
            )}
          </div>
        )}
      </div>

      {/* Manage Treasury */}
      <div className="bg-white shadow rounded-xl p-6 space-y-4">

        <h3 className="font-semibold text-lg">Manage Treasury</h3>

        <input
          type="number"
          placeholder="Enter amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="border px-4 py-2 rounded w-full"
        />

        <div className="flex gap-4">
          <button
            onClick={handleDeposit}
            disabled={loading}
            className="bg-emerald-600 text-white px-6 py-2 rounded hover:bg-emerald-700 disabled:opacity-50"
          >
            Deposit
          </button>

          <button
            onClick={handleWithdraw}
            disabled={loading}
            className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 disabled:opacity-50"
          >
            Withdraw
          </button>
        </div>

      </div>

    </div>
  );
}
