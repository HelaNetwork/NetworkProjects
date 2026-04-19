import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Play, PauseCircle } from "lucide-react";
import { getEmployee, startStream, pauseStream, createTransaction, getBlockchainConfig, updateEmployeeWallet } from "../../../app/api";
import { loginAndConnectContract } from "../../../blockchain/web3Auth";
import { HELA_CHAIN_CONFIG, CORE_PAYROLL_ABI } from "../../../blockchain/config";
import { ethers } from "ethers";

export default function EmployeeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [salaryAmount, setSalaryAmount] = useState("");
  const [salaryDesc, setSalaryDesc] = useState("");
  const [payLoading, setPayLoading] = useState(false);
  const [contractAddress, setContractAddress] = useState<string | null>(null);
  const [onChainLoading, setOnChainLoading] = useState(false);
  const [ratePerSecond, setRatePerSecond] = useState("");
  const [streamDetails, setStreamDetails] = useState<{
    ratePerSecond?: string;
    lastWithdrawTime?: number;
    accruedBalance?: string;
    isActive?: boolean;
  } | null>(null);

  useEffect(() => {
    if (!id) return;
    getEmployee(Number(id))
      .then(setEmployee)
      .catch(() => setEmployee(null));
    getBlockchainConfig().then((cfg: any) => cfg?.contract_address && setContractAddress(cfg.contract_address));
  }, [id]);

  const handleActivate = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await startStream(Number(id));
      setEmployee((prev: any) => ({ ...prev, is_streaming: data.is_streaming }));
    } catch {
      alert("Activate failed");
    } finally {
      setLoading(false);
    }
  };

  const handlePause = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await pauseStream(Number(id));
      setEmployee((prev: any) => ({ ...prev, is_streaming: data.is_streaming }));
    } catch {
      alert("Pause failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLinkWallet = async () => {
    if (!id || !contractAddress) return;
    setOnChainLoading(true);
    try {
      const { address } = await loginAndConnectContract(contractAddress);
      await updateEmployeeWallet(Number(id), address);
      const updated = await getEmployee(Number(id));
      setEmployee(updated);
    } catch (err: any) {
      alert(err?.message || "Failed to link wallet");
    } finally {
      setOnChainLoading(false);
    }
  };

  const handleStartOnChainStream = async () => {
    if (!id || !contractAddress || !employee?.wallet_address) {
      alert("Employee must have wallet linked first");
      return;
    }
    const rate = ratePerSecond ? ethers.parseEther(ratePerSecond) : ethers.parseEther("0.0001");
    setOnChainLoading(true);
    try {
      const { contract } = await loginAndConnectContract(contractAddress);
      const tx = await contract.startStream(employee.wallet_address, rate);
      await tx.wait();
      await startStream(Number(id));
      const updated = await getEmployee(Number(id));
      setEmployee(updated);
      setRatePerSecond("");
    } catch (err: any) {
      alert(err?.message || "Failed to start on-chain stream");
    } finally {
      setOnChainLoading(false);
    }
  };

  const handleStopOnChainStream = async () => {
    if (!id || !contractAddress || !employee?.wallet_address) return;
    setOnChainLoading(true);
    try {
      const { contract } = await loginAndConnectContract(contractAddress);
      const tx = await contract.stopStream(employee.wallet_address);
      await tx.wait();
      await pauseStream(Number(id));
      const updated = await getEmployee(Number(id));
      setEmployee(updated);
    } catch (err: any) {
      alert(err?.message || "Failed to stop on-chain stream");
    } finally {
      setOnChainLoading(false);
    }
  };

  useEffect(() => {
    async function loadStreamDetails() {
      if (!contractAddress || !employee?.wallet_address) {
        setStreamDetails(null);
        return;
      }
      try {
        const provider = new ethers.JsonRpcProvider(HELA_CHAIN_CONFIG.rpcTarget);
        const roContract = new ethers.Contract(contractAddress, CORE_PAYROLL_ABI, provider);
        const s = await roContract.streams(employee.wallet_address);
        const details = {
          ratePerSecond:
            (s.ratePerSecond && s.ratePerSecond.toString?.()) || (s[0] && s[0].toString?.()),
          lastWithdrawTime:
            (typeof s.lastWithdrawTime === "bigint" ? Number(s.lastWithdrawTime) : s[1] ? Number(s[1]) : undefined),
          accruedBalance:
            (s.accruedBalance && s.accruedBalance.toString?.()) || (s[2] && s[2].toString?.()),
          isActive:
            typeof s.isActive === "boolean" ? s.isActive : typeof s[3] === "boolean" ? s[3] : undefined,
        };
        setStreamDetails(details);
      } catch {
        setStreamDetails(null);
      }
    }
    loadStreamDetails();
  }, [contractAddress, employee?.wallet_address, employee?.is_streaming]);

  const handlePaySalary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !salaryAmount) return;
    setPayLoading(true);
    try {
      await createTransaction(Number(id), Number(salaryAmount), salaryDesc || "Salary payment");
      setSalaryAmount("");
      setSalaryDesc("");
      const updated = await getEmployee(Number(id));
      setEmployee(updated);
    } catch (err: any) {
      alert(err.message || "Payment failed");
    } finally {
      setPayLoading(false);
    }
  };

  if (!employee) return <div className="p-10">Loading...</div>;

  return (
    <div className="space-y-8 p-6">

      <button
        type="button"
        onClick={() => navigate(-1)}
        className="text-blue-500 hover:underline"
      >
        ← Back
      </button>

      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-semibold">
          {employee.name}
        </h2>

        <p className="text-slate-600 mt-2">
          Role: {employee.role}
        </p>

        {employee.wallet_address ? (
          <p className="text-slate-500 text-sm mt-1">
            Wallet: {employee.wallet_address.slice(0, 10)}...{employee.wallet_address.slice(-8)}
          </p>
        ) : contractAddress && (
          <button
            onClick={handleLinkWallet}
            disabled={onChainLoading}
            className="mt-2 px-4 py-1 text-sm bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 disabled:opacity-50"
          >
            {onChainLoading ? "Connecting..." : "Link Wallet (Web3Auth)"}
          </button>
        )}

        <div className="mt-4 flex items-center gap-4">

          <span
            className={`px-4 py-1 rounded-full font-semibold ${employee.is_streaming
                ? "bg-green-500 text-white"
                : "bg-red-500 text-white"
              }`}
          >
            {employee.is_streaming ? "Active" : "Paused"}
          </span>
        </div>
      </div>

      <div className="flex gap-6">
        <button
          type="button"
          disabled={loading}
          onClick={handleActivate}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-green-600 text-white disabled:opacity-50"
        >
          <Play size={18} />
          Activate
        </button>

        <button
          type="button"
          disabled={loading}
          onClick={handlePause}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 text-white disabled:opacity-50"
        >
          <PauseCircle size={18} />
          Pause
        </button>
      </div>

      {/* On-Chain Stream (when wallet linked and contract configured) */}
      {contractAddress && employee?.wallet_address && (
        <div className="bg-indigo-50 border border-indigo-200 p-6 rounded-xl">
          <h3 className="font-semibold text-indigo-900 mb-2">On-Chain Stream (HeLa)</h3>
          <div className="flex flex-wrap gap-2 items-end">
            <div>
              <label className="block text-xs text-indigo-700 mb-1">Rate (HLUSD/sec)</label>
              <input
                type="text"
                placeholder="0.0001"
                value={ratePerSecond}
                onChange={(e) => setRatePerSecond(e.target.value)}
                className="border px-3 py-2 rounded w-32 text-sm"
              />
            </div>
            <button
              onClick={handleStartOnChainStream}
              disabled={onChainLoading || employee?.is_streaming}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50"
            >
              {onChainLoading ? "..." : "Start On-Chain Stream"}
            </button>
            <button
              onClick={handleStopOnChainStream}
              disabled={onChainLoading || !employee?.is_streaming}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 disabled:opacity-50"
            >
              Stop On-Chain Stream
            </button>
          </div>
          {streamDetails && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg border border-indigo-200 p-4">
                <p className="text-xs text-indigo-700 mb-1">Current Rate</p>
                <p className="text-sm text-indigo-900 font-semibold">
                  {streamDetails.ratePerSecond
                    ? `${Number(ethers.formatEther(streamDetails.ratePerSecond)).toFixed(6)} HLUSD/sec`
                    : "—"}
                </p>
              </div>
              <div className="bg-white rounded-lg border border-indigo-200 p-4">
                <p className="text-xs text-indigo-700 mb-1">Accrued Balance</p>
                <p className="text-sm text-indigo-900 font-semibold">
                  {streamDetails.accruedBalance
                    ? `${Number(ethers.formatEther(streamDetails.accruedBalance)).toFixed(6)} HLUSD`
                    : "—"}
                </p>
                <p className="text-xs text-indigo-600 mt-1">
                  Last Withdraw:{" "}
                  {streamDetails.lastWithdrawTime
                    ? new Date(streamDetails.lastWithdrawTime * 1000).toLocaleString()
                    : "—"}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Pay Salary (only when stream is active) */}
      {employee.is_streaming && (
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Pay Salary (Gross)</h3>
          <form onSubmit={handlePaySalary} className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-sm text-slate-600 mb-1">Amount (₹)</label>
              <input
                type="number"
                value={salaryAmount}
                onChange={(e) => setSalaryAmount(e.target.value)}
                placeholder="Amount"
                className="border px-4 py-2 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">Description</label>
              <input
                type="text"
                value={salaryDesc}
                onChange={(e) => setSalaryDesc(e.target.value)}
                placeholder="e.g. March salary"
                className="border px-4 py-2 rounded-lg"
              />
            </div>
            <button
              type="submit"
              disabled={payLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {payLoading ? "Processing..." : "Pay"}
            </button>
          </form>
        </div>
      )}

      {/* Transaction history */}
      {employee.transactions && employee.transactions.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
          <ul className="space-y-2">
            {employee.transactions.slice(0, 10).map((t: any) => (
              <li key={t.id} className="flex justify-between py-2 border-b last:border-0">
                <span className="text-slate-600">{t.description}</span>
                <span className="font-medium">₹ {Number(t.amount).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

    </div>
  );
}
