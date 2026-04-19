"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useAccount, useChainId, useReadContract, useReadContracts, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther, formatUnits } from "viem";
import { NativePayStreamABI } from "@/abis/NativePayStream";
import { PAYSTREAM_ADDRESS } from "@/config/wagmi";
import { useAuth } from "@/context/AuthContext";
import { Wallet, TrendingUp, Users, AlertTriangle, Landmark, Sprout } from "lucide-react";
import { StatsCard } from "./components/StatsCard";
import { NativeTreasuryCard } from "./components/NativeTreasuryCard";
import { CreateStreamForm } from "@/components/streams/CreateStreamForm";
import { BonusForm } from "@/components/streams/BonusForm";
import { BulkCreateStreamForm } from "@/components/streams/BulkCreateStreamForm";
import { StreamRow } from "./components/StreamRow";
import { NotificationDropdown } from "./components/NotificationDropdown";
import { EmptyStreamsState } from "./components/EmptyStreamsState";

const SYMBOL = "HEA";
const HELA_CHAIN_ID = 666888;

export default function HRDashboardContent() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { role } = useAuth();
  const [depositAmount, setDepositAmount] = useState("");
  const [toast, setToast] = useState("");
  const [addHRAddress, setAddHRAddress] = useState("");
  const [removeHRAddress, setRemoveHRAddress] = useState("");
  const [transferOwnerAddress, setTransferOwnerAddress] = useState("");
  const [streamsRefetchTrigger, setStreamsRefetchTrigger] = useState(0);

  // New State for Yield
  const [yieldAmount, setYieldAmount] = useState("");

  const hasContract = PAYSTREAM_ADDRESS?.length > 0;
  const isWrongChain = isConnected && chainId !== HELA_CHAIN_ID;

  const { data: treasuryBalance, refetch: refetchTreasury } = useReadContract({
    address: hasContract ? (PAYSTREAM_ADDRESS as `0x${string}`) : undefined,
    abi: NativePayStreamABI,
    functionName: "treasuryBalance",
  });
  const { data: hrAddress } = useReadContract({
    address: hasContract ? (PAYSTREAM_ADDRESS as `0x${string}`) : undefined,
    abi: NativePayStreamABI,
    functionName: "deployer",
  });
  const { data: ownerAddress } = useReadContract({
    address: hasContract ? (PAYSTREAM_ADDRESS as `0x${string}`) : undefined,
    abi: NativePayStreamABI,
    functionName: "owner",
  });
  const { data: isHRFromContract } = useReadContract({
    address: hasContract && address ? (PAYSTREAM_ADDRESS as `0x${string}`) : undefined,
    abi: NativePayStreamABI,
    functionName: "isHR",
    args: address ? [address] : undefined,
  });
  const { data: nextStreamId, refetch: refetchNextId } = useReadContract({
    address: hasContract ? (PAYSTREAM_ADDRESS as `0x${string}`) : undefined,
    abi: NativePayStreamABI,
    functionName: "nextStreamId",
  });
  const { data: taxBps } = useReadContract({
    address: hasContract ? (PAYSTREAM_ADDRESS as `0x${string}`) : undefined,
    abi: NativePayStreamABI,
    functionName: "taxBps",
  });
  const { data: taxVaultAddress } = useReadContract({
    address: hasContract ? (PAYSTREAM_ADDRESS as `0x${string}`) : undefined,
    abi: NativePayStreamABI,
    functionName: "taxVault",
  });
  const hasTax =
    taxBps != null &&
    BigInt(taxBps as any) > BigInt(0) &&
    taxVaultAddress != null &&
    taxVaultAddress !== "0x0000000000000000000000000000000000000000";
  const streamIdsForCount = useMemo(
    () => Array.from({ length: Math.min(nextStreamId != null ? Number(nextStreamId) : 0, 50) }, (_, i) => i),
    [nextStreamId]
  );
  const { data: streamsBatch } = useReadContracts({
    contracts:
      hasContract && streamIdsForCount.length > 0
        ? streamIdsForCount.map((id) => ({
          address: PAYSTREAM_ADDRESS,
          abi: NativePayStreamABI,
          functionName: "streams" as const,
          args: [BigInt(id)] as const,
        }))
        : [],
  });
  const activeCount = useMemo(() => {
    if (!streamsBatch) return 0;
    return streamsBatch.filter((r) => {
      if (r.status !== "success" || !r.result) return false;
      // Handle both array (index 5) and object (.active) return types
      const res = r.result as any;
      if (Array.isArray(res)) return res[5] === true;
      return res.active === true;
    }).length;
  }, [streamsBatch]);

  const isHR =
    hasContract &&
    address &&
    (isHRFromContract === true || (isHRFromContract === undefined && hrAddress && address.toLowerCase() === String(hrAddress).toLowerCase()));

  const isOwner = hasContract && address && ownerAddress && address.toLowerCase() === String(ownerAddress).toLowerCase();

  console.log("DEBUG: Owner Check", {
    connectedAddress: address,
    contractOwner: ownerAddress,
    isOwner,
    hasContract
  });

  const showContent = role === "hr" && isConnected;

  const writeDeposit = useWriteContract();
  const writeCreate = useWriteContract();
  const writePause = useWriteContract();
  const writeResume = useWriteContract();
  const writeCancel = useWriteContract();
  const writeAddHR = useWriteContract();
  const writeRemoveHR = useWriteContract();
  const writeTransferOwner = useWriteContract();
  const writeWithdrawTreasury = useWriteContract();

  // New Write Hook for Add Yield
  const writeAddYield = useWriteContract();

  const { isLoading: depositLoading } = useWaitForTransactionReceipt({ hash: writeDeposit.data });
  const { isLoading: createLoading } = useWaitForTransactionReceipt({ hash: writeCreate.data });
  const { isLoading: pauseLoading } = useWaitForTransactionReceipt({ hash: writePause.data });
  const { isLoading: resumeLoading } = useWaitForTransactionReceipt({ hash: writeResume.data });
  const { isLoading: cancelLoading } = useWaitForTransactionReceipt({ hash: writeCancel.data });
  const { isLoading: addHRLoading } = useWaitForTransactionReceipt({ hash: writeAddHR.data });
  const { isLoading: removeHRLoading } = useWaitForTransactionReceipt({ hash: writeRemoveHR.data });
  const { isLoading: transferOwnerLoading } = useWaitForTransactionReceipt({ hash: writeTransferOwner.data });
  const { isLoading: withdrawTreasuryLoading } = useWaitForTransactionReceipt({ hash: writeWithdrawTreasury.data });

  // New Wait Hook for Add Yield
  const { isLoading: addYieldLoading } = useWaitForTransactionReceipt({ hash: writeAddYield.data });

  useEffect(() => {
    if (createLoading === false && writeCreate.data) {
      refetchNextId?.();
      refetchTreasury?.();
    }
  }, [createLoading, writeCreate.data, refetchNextId, refetchTreasury]);
  const lastCancelHash = useRef<string | null>(null);
  useEffect(() => {
    if (cancelLoading === false && writeCancel.data && writeCancel.data !== lastCancelHash.current) {
      lastCancelHash.current = writeCancel.data;
      setStreamsRefetchTrigger((t) => t + 1);
      refetchTreasury?.();
      setToast("Stream cancelled. Employee received their accrued amount; remainder returned to you.");
    }
  }, [cancelLoading, writeCancel.data, refetchTreasury]);
  useEffect(() => {
    if (writeCancel.error) setToast(writeCancel.error.message || "Cancel failed. Check wallet and try again.");
  }, [writeCancel.error]);
  useEffect(() => {
    if (cancelLoading === false && writeCancel.data) refetchNextId?.();
  }, [cancelLoading, writeCancel.data, refetchNextId]);
  useEffect(() => {
    if (depositLoading === false && writeDeposit.data) refetchTreasury?.();
  }, [depositLoading, writeDeposit.data, refetchTreasury]);
  const lastDepositHash = useRef<string | null>(null);
  useEffect(() => {
    if (depositLoading === false && writeDeposit.data && writeDeposit.data !== lastDepositHash.current) {
      lastDepositHash.current = writeDeposit.data;
      setToast("Deposit confirmed.");
    }
  }, [depositLoading, writeDeposit.data]);
  useEffect(() => {
    if (addHRLoading === false && writeAddHR.data) {
      setToast("HR added. They can now use this dashboard.");
      setAddHRAddress("");
    }
  }, [addHRLoading, writeAddHR.data]);
  useEffect(() => {
    if (removeHRLoading === false && writeRemoveHR.data) {
      setToast("HR removed.");
      setRemoveHRAddress("");
    }
  }, [removeHRLoading, writeRemoveHR.data]);
  useEffect(() => {
    if (transferOwnerLoading === false && writeTransferOwner.data) {
      setToast("Ownership transferred. The new owner can now add/remove HRs.");
      setTransferOwnerAddress("");
    }
  }, [transferOwnerLoading, writeTransferOwner.data]);
  useEffect(() => {
    if (withdrawTreasuryLoading === false && writeWithdrawTreasury.data) {
      refetchTreasury?.();
      setToast("Treasury withdrawn to your wallet.");
    }
  }, [withdrawTreasuryLoading, writeWithdrawTreasury.data, refetchTreasury]);
  useEffect(() => {
    const err = writeWithdrawTreasury.error;
    if (!err) return;
    const msg = err?.message ?? "";
    if (msg.includes("Unauthorized")) {
      setToast("Withdraw failed: only the contract owner can withdraw treasury.");
    } else if (msg.includes("InsufficientContractBalance")) {
      setToast("Withdraw failed: contract balance is lower than requested.");
    } else {
      setToast((err as any)?.shortMessage ?? err?.message ?? "Withdraw failed.");
    }
  }, [writeWithdrawTreasury.error]);

  // New Effect for Add Yield
  useEffect(() => {
    if (addYieldLoading === false && writeAddYield.data) {
      setToast("Yield added successfully.");
      refetchTreasury?.();
      setYieldAmount("");
    }
  }, [addYieldLoading, writeAddYield.data, refetchTreasury]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const displayTreasury = treasuryBalance != null ? formatUnits(treasuryBalance, 18) : "—";
  const totalStreamCount = nextStreamId != null ? Number(nextStreamId) : 0;
  const streamIds = streamIdsForCount;

  const handleDeposit = () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) return;
    try {
      writeDeposit.writeContract({
        address: PAYSTREAM_ADDRESS,
        abi: NativePayStreamABI,
        functionName: "deposit",
        value: parseEther(depositAmount),
      });
    } catch (err) {
      setToast(err instanceof Error ? err.message : "Deposit failed.");
    }
  };

  // New Handler for Add Yield
  const handleAddYield = () => {
    if (!yieldAmount || parseFloat(yieldAmount) <= 0) return;
    try {
      writeAddYield.writeContract({
        address: PAYSTREAM_ADDRESS,
        abi: NativePayStreamABI,
        functionName: "addYield",
        value: parseEther(yieldAmount),
      });
    } catch (err) {
      setToast(err instanceof Error ? err.message : "Add Yield failed.");
    }
  };

  const handlePause = (id: number) => {
    writePause.writeContract({
      address: PAYSTREAM_ADDRESS,
      abi: NativePayStreamABI,
      functionName: "pauseStream",
      args: [BigInt(id)],
    });
  };

  const handleResume = (id: number) => {
    writeResume.writeContract({
      address: PAYSTREAM_ADDRESS,
      abi: NativePayStreamABI,
      functionName: "resumeStream",
      args: [BigInt(id)],
    });
  };

  const handleCancel = (id: number) => {
    writeCancel.writeContract({
      address: PAYSTREAM_ADDRESS,
      abi: NativePayStreamABI,
      functionName: "cancelStream",
      args: [BigInt(id)],
    });
  };

  const isValidEthAddress = (s: string) => /^0x[a-fA-F0-9]{40}$/.test(s?.trim() ?? "");

  const handleAddHR = () => {
    if (!addHRAddress?.trim() || !isValidEthAddress(addHRAddress.trim())) {
      setToast("Enter a valid 0x address.");
      return;
    }
    writeAddHR.writeContract({
      address: PAYSTREAM_ADDRESS,
      abi: NativePayStreamABI,
      functionName: "addHR",
      args: [addHRAddress.trim() as `0x${string}`],
    });
  };

  const handleRemoveHR = () => {
    if (!removeHRAddress?.trim() || !isValidEthAddress(removeHRAddress.trim())) {
      setToast("Enter a valid 0x address.");
      return;
    }
    writeRemoveHR.writeContract({
      address: PAYSTREAM_ADDRESS,
      abi: NativePayStreamABI,
      functionName: "removeHR",
      args: [removeHRAddress.trim() as `0x${string}`],
    });
  };

  const handlePanicPause = async () => {
    if (!streamsBatch) return;
    const activeIds: bigint[] = [];
    streamsBatch.forEach((r, i) => {
      if (r.status === "success" && r.result) {
        const res = r.result as any;
        const isActive = Array.isArray(res) ? res[5] : res.active;
        if (isActive) activeIds.push(BigInt(streamIdsForCount[i]));
      }
    });

    if (activeIds.length === 0) {
      setToast("No active streams found to pause.");
      return;
    }

    let count = 0;
    for (const id of activeIds) {
      try {
        await writePause.writeContractAsync({
          address: PAYSTREAM_ADDRESS,
          abi: NativePayStreamABI,
          functionName: "pauseStream",
          args: [id],
        });
        count++;
      } catch (e) {
        console.error("Failed to pause", id, e);
      }
    }
    if (count > 0) setToast(`Sent pause transactions for ${count} streams.`);
  };

  const handleTransferOwnership = () => {
    if (!transferOwnerAddress?.trim() || !isValidEthAddress(transferOwnerAddress.trim())) {
      setToast("Enter a valid 0x address.");
      return;
    }
    writeTransferOwner.writeContract({
      address: PAYSTREAM_ADDRESS,
      abi: NativePayStreamABI,
      functionName: "transferOwnership",
      args: [transferOwnerAddress.trim() as `0x${string}`],
    });
  };

  const handleWithdrawTreasury = async () => {
    if (!treasuryBalance || treasuryBalance === BigInt(0)) {
      setToast("No balance to withdraw.");
      return;
    }
    const { data: freshBalance } = (await refetchTreasury?.()) ?? { data: treasuryBalance };
    if (!freshBalance || freshBalance === BigInt(0)) {
      setToast("No balance to withdraw.");
      return;
    }
    writeWithdrawTreasury.writeContract({
      address: PAYSTREAM_ADDRESS,
      abi: NativePayStreamABI,
      functionName: "withdrawTreasury",
      args: [freshBalance],
    });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0B0F19]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(16,185,129,0.12),transparent)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
      <div className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {role === "hr" && <p className="mb-1 text-sm text-emerald-400">Signed in as {isOwner ? "Owner (Super Admin)" : "HR Manager"}</p>}
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Dashboard</h1>
            <p className="mt-1 text-zinc-500">Treasury and streams (native {SYMBOL}).</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-emerald-400">{SYMBOL}</span>
            <span className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-400">HeLa Testnet</span>
            {isConnected && address && (
              <span className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                {address.slice(0, 6)}...{address.slice(-4)}
              </span>
            )}
            <NotificationDropdown />
          </div>
        </header>

        {!hasContract && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
            <h2 className="text-lg font-semibold text-white">Get started with real {SYMBOL}</h2>
            <p className="mt-2 text-zinc-400">Deploy the contract and point the app to it.</p>
            <ol className="mt-4 list-inside list-decimal space-y-2 text-sm text-zinc-300">
              <li>Open <code className="rounded bg-white/10 px-1 py-0.5 font-mono text-xs">paystream-contract</code> and add a <code className="rounded bg-white/10 px-1 py-0.5 font-mono text-xs">.env</code> with <code className="rounded bg-white/10 px-1 py-0.5 font-mono text-xs">PRIVATE_KEY</code> (wallet with HEA for gas).</li>
              <li>Run <code className="rounded bg-white/10 px-1 py-0.5 font-mono text-xs">npm run deploy:native</code> to deploy NativePayStream on HeLa Testnet.</li>
              <li>Copy the printed <code className="rounded bg-white/10 px-1 py-0.5 font-mono text-xs">NATIVE_PAYSTREAM_ADDRESS</code>.</li>
              <li>In <code className="rounded bg-white/10 px-1 py-0.5 font-mono text-xs">paystream-frontend/.env.local</code> set <code className="rounded bg-white/10 px-1 py-0.5 font-mono text-xs">NEXT_PUBLIC_PAYSTREAM_ADDRESS=&lt;that address&gt;</code>.</li>
              <li>Restart the frontend dev server and refresh this page.</li>
            </ol>
            <p className="mt-4 text-xs text-zinc-500">Use the same wallet as deployer to act as HR. You need some HEA for deployment and for deposits.</p>
          </div>
        )}
        {hasContract && !isConnected && (
          <div className="rounded-2xl border border-white/10 bg-white/5 py-16 text-center backdrop-blur-xl">
            <p className="text-zinc-500">Connect your wallet (MetaMask) to use the Dashboard.</p>
            <p className="mt-2 text-sm text-zinc-600">Please connect your wallet.</p>
          </div>
        )}
        {hasContract && isWrongChain && (
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 py-8 text-center text-amber-400">
            <p className="font-medium">Wrong network</p>
            <p className="mt-1 text-sm">Switch MetaMask to <strong>HeLa Testnet</strong> (Chain ID 666888) to continue.</p>
          </div>
        )}
        {showContent && (
          <div className="space-y-8">
            {hasContract && isConnected && !isHR && (
              <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-4 text-sm text-amber-300/95">
                <p className="font-medium">Your wallet is not authorized.</p>
                <p className="mt-2">Contact the Owner to be added as an HR Manager.</p>
              </div>
            )}
            {toast && (
              <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white shadow-lg">
                {toast}
              </div>
            )}

            {treasuryBalance != null && treasuryBalance === BigInt(0) && activeCount > 0 && (
              <div className="rounded-xl border border-red-500/50 bg-red-500/10 px-4 py-4 text-red-200 animate-pulse-slow">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 shrink-0 text-red-500" />
                  <div className="flex-1">
                    <p className="font-bold text-red-400">CRITICAL: TREASURY EMPTY</p>
                    <p className="mt-1 text-sm">
                      You have {activeCount} active streams but 0 Treasury balance. Streams are accruing debt that cannot be paid.
                    </p>
                    <button
                      type="button"
                      onClick={handlePanicPause}
                      className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-500 shadow-lg shadow-red-900/20"
                    >
                      PAUSE ALL ACTIVE STREAMS NOW
                    </button>
                    <p className="mt-2 text-xs text-red-300/70">
                      *Will trigger a transaction for each active stream. Please approve all.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <StatsCard title="Treasury Balance" value={displayTreasury} subtitle={SYMBOL} change={0} icon={Wallet} delay={0} />
              <StatsCard title="Active Streams" value={String(activeCount)} subtitle="streams" change={0} icon={TrendingUp} delay={0.05} />
              <StatsCard title="Total Streams" value={String(totalStreamCount)} subtitle="created" icon={Users} delay={0.1} />
            </div>
            {hasTax && (
              <p className="text-xs text-zinc-500">
                Tax vault: {(Number(taxBps) / 100).toFixed(0)}% of each employee withdraw goes to{" "}
                <span className="font-mono text-zinc-400">{String(taxVaultAddress).slice(0, 10)}…{String(taxVaultAddress).slice(-8)}</span>
              </p>
            )}

            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-4">
                <NativeTreasuryCard
                  treasuryBalance={displayTreasury}
                  depositAmount={depositAmount}
                  onDepositAmountChange={setDepositAmount}
                  onDeposit={handleDeposit}
                  isDepositPending={depositLoading || writeDeposit.isPending}
                />

                {/* New Inject Yield Section - Owner Only */}
                {isOwner && (
                  <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Sprout className="h-4 w-4 text-emerald-400" />
                      <p className="text-sm font-medium text-emerald-200">Inject Yield (Owner Only)</p>
                    </div>
                    <p className="text-xs text-emerald-200/80 mb-3">
                      Directly add yield to the protocol from external sources (e.g. DeFi profits).
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="0.0"
                        value={yieldAmount}
                        onChange={(e) => setYieldAmount(e.target.value)}
                        className="flex-1 rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white focus:border-emerald-500/50 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleAddYield}
                        disabled={!yieldAmount || writeAddYield.isPending || addYieldLoading}
                        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
                      >
                        {writeAddYield.isPending || addYieldLoading ? "Adding..." : "Add Yield"}
                      </button>
                    </div>
                  </div>
                )}

                {isOwner && treasuryBalance != null && treasuryBalance > BigInt(0) && (
                  <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3">
                    <p className="text-sm font-medium text-amber-200">Withdraw treasury to your wallet</p>
                    <p className="mt-1 text-xs text-amber-200/80">
                      Owner only. Sends contract balance (unallocated or leftover after streams) to your wallet. Ensure no active streams need this balance before withdrawing.
                    </p>
                    <button
                      type="button"
                      onClick={handleWithdrawTreasury}
                      disabled={writeWithdrawTreasury.isPending || withdrawTreasuryLoading}
                      className="mt-3 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-400 disabled:opacity-50"
                    >
                      {writeWithdrawTreasury.isPending || withdrawTreasuryLoading ? "Withdrawing…" : `Withdraw ${displayTreasury} ${SYMBOL}`}
                    </button>
                  </div>
                )}
              </div>
              <div id="add-employee" className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                <h2 className="text-lg font-semibold text-white">Create stream</h2>
                <p className="mt-1 text-sm text-zinc-500">Total {SYMBOL} + duration. Rate computed automatically.</p>
                <div className="mt-4">
                  <CreateStreamForm onSuccess={() => { refetchNextId?.(); refetchTreasury?.(); }} treasuryBalance={treasuryBalance} />
                </div>
              </div>
            </div>

            {hasContract && (
              <div className="grid gap-8 lg:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                  <h2 className="text-lg font-semibold text-white">One-time bonus (streaming spike)</h2>
                  <p className="mt-1 text-sm text-zinc-500">Add {SYMBOL} from treasury to an existing stream. Employee accrues the extra amount at the same rate until paused or cancelled.</p>
                  <div className="mt-4">
                    <BonusForm
                      onSuccess={() => {
                        refetchTreasury?.();
                        setStreamsRefetchTrigger((t) => t + 1);
                        setToast("Bonus applied.");
                      }}
                    />
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                  <h2 className="text-lg font-semibold text-white">Bulk add streams (CSV)</h2>
                  <p className="mt-1 text-sm text-zinc-500">Paste address, total amount, duration (seconds) per line.</p>
                  <div className="mt-4">
                    <BulkCreateStreamForm onSuccess={() => { refetchNextId?.(); refetchTreasury?.(); setToast("Streams created."); }} />
                  </div>
                </div>
              </div>
            )}

            {hasContract && (
              <div className="grid gap-8 lg:grid-cols-2">
                <div className="rounded-2xl border border-violet-500/25 bg-violet-500/10 p-6 backdrop-blur-xl">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-violet-500/20 p-2 text-violet-400">
                      <Landmark className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-white">Fiat Ramps</h2>
                      <p className="text-xs text-violet-300">Convert HEA ↔ Local Currency</p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-zinc-400">
                    Integrate providers (MoonPay, Transak) to let employees convert streamed crypto directly to bank accounts.
                  </p>
                  <div className="mt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setToast("Opening On-Ramp provider... (Mock)")}
                      className="flex-1 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-500"
                    >
                      Buy HEA
                    </button>
                    <button
                      type="button"
                      onClick={() => setToast("Opening Off-Ramp provider... (Mock)")}
                      className="flex-1 rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-2.5 text-sm font-semibold text-violet-300 hover:bg-violet-500/20"
                    >
                      Sell HEA
                    </button>
                  </div>
                </div>

                {/* Replaced Yield Optimization with Static Info since we have Inject Yield above */}
                <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-6 backdrop-blur-xl">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-emerald-500/20 p-2 text-emerald-400">
                      <Sprout className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-white">Yield Status</h2>
                      <p className="text-xs text-emerald-300">Protocol Health</p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-zinc-400">
                    Active yield strategy allows the protocol to sustain stream liabilities.
                  </p>
                  <div className="mt-4 flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
                    <div>
                      <p className="text-xs font-medium text-zinc-500">Strategy</p>
                      <p className="font-mono text-lg font-bold text-emerald-400">Manual Injection</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                      </span>
                      <span className="text-xs font-medium text-emerald-400">Active</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {hasContract && isOwner && (
              <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-6 backdrop-blur-xl">
                <h2 className="text-lg font-semibold text-white">Manage HRs &amp; Ownership</h2>
                <p className="mt-1 text-sm text-zinc-400">As the contract owner (Super Admin), you can manage privileges.</p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-zinc-400">Add HR (wallet address)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="0x..."
                        value={addHRAddress}
                        onChange={(e) => setAddHRAddress(e.target.value)}
                        className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:border-cyan-500/50 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleAddHR}
                        disabled={!addHRAddress?.trim() || writeAddHR.isPending || addHRLoading}
                        className="rounded-xl bg-cyan-500 px-4 py-3 text-sm font-medium text-white hover:bg-cyan-400 disabled:opacity-50"
                      >
                        {writeAddHR.isPending || addHRLoading ? "…" : "Add HR"}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-zinc-400">Remove HR (wallet address)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="0x..."
                        value={removeHRAddress}
                        onChange={(e) => setRemoveHRAddress(e.target.value)}
                        className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:border-cyan-500/50 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveHR}
                        disabled={!removeHRAddress?.trim() || writeRemoveHR.isPending || removeHRLoading}
                        className="rounded-xl bg-rose-500/80 px-4 py-3 text-sm font-medium text-white hover:bg-rose-500 disabled:opacity-50"
                      >
                        {writeRemoveHR.isPending || removeHRLoading ? "…" : "Remove HR"}
                      </button>
                    </div>
                  </div>
                </div>
                {ownerAddress != null && (
                  <div className="mt-6 border-t border-cyan-500/20 pt-4">
                    <label className="mb-1.5 block text-sm font-medium text-zinc-400">Transfer Ownership (pass Super Admin role)</label>
                    <p className="mb-2 text-xs text-zinc-500">The new owner will gain full control. Add them as HR first recommended.</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="New owner 0x..."
                        value={transferOwnerAddress}
                        onChange={(e) => setTransferOwnerAddress(e.target.value)}
                        className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:border-cyan-500/50 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleTransferOwnership}
                        disabled={!transferOwnerAddress?.trim() || writeTransferOwner.isPending || transferOwnerLoading}
                        className="rounded-xl bg-amber-500/90 px-4 py-3 text-sm font-medium text-white hover:bg-amber-500 disabled:opacity-50"
                      >
                        {writeTransferOwner.isPending || transferOwnerLoading ? "…" : "Transfer"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <section>
              <h2 className="mb-4 text-lg font-semibold text-white">Streams</h2>
              {streamIds.length === 0 ? (
                <EmptyStreamsState onAddFirst={() => document.getElementById("add-employee")?.scrollIntoView({ behavior: "smooth" })} />
              ) : (
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[640px]">
                      <thead>
                        <tr className="border-b border-white/10 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                          <th className="p-4">ID</th>
                          <th className="p-4">Employee</th>
                          <th className="p-4">Rate /s</th>
                          <th className="p-4">Accrued</th>
                          <th className="p-4">Status</th>
                          <th className="p-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {streamIds.map((id, i) => (
                          <StreamRow
                            key={id}
                            streamId={id}
                            onPause={handlePause}
                            onResume={handleResume}
                            onCancel={handleCancel}
                            isPausePending={pauseLoading || writePause.isPending}
                            isResumePending={resumeLoading || writeResume.isPending}
                            isCancelPending={cancelLoading || writeCancel.isPending}
                            index={i}
                            refetchTrigger={streamsRefetchTrigger}
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
