"use client";

import { useState, useEffect } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther, formatEther } from "viem";
import { motion, AnimatePresence } from "framer-motion";
import { CONTRACTS, PAYSTREAM_ABI, TREASURY_ABI, HLUSD_ABI, TAX_VAULT_ABI } from "../../config/contracts";
import {
    IconTreasury, IconPlus, IconList, IconScale, IconDownload,
    IconStream, IconUpload, IconFileText, IconPause, IconPlay, IconX,
    IconCheck, IconClock, IconChart, IconDollar, IconBuilding, IconShield
} from "../../components/Icons";
import { TiltCard } from "../../components/TiltCard";

type StreamData = {
    employee: string; status: number; taxBps: number; startTime: bigint; endTime: bigint;
    pausedAt: bigint; totalPaused: bigint; ratePerSecond: bigint; deposited: bigint;
    withdrawn: bigint; remainder: bigint;
};

const STATUS_LABELS = ["None", "Active", "Paused", "Canceled"];
const STATUS_BADGE = ["", "badge-active", "badge-paused", "badge-canceled"];

const TABS = [
    { key: "treasury" as const, label: "Treasury", icon: IconTreasury },
    { key: "create" as const, label: "Create Stream", icon: IconPlus },
    { key: "manage" as const, label: "Manage", icon: IconList },
    { key: "compliance" as const, label: "Compliance", icon: IconScale },
];

const tabMotion = {
    hidden: { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
    exit: { opacity: 0, y: -6, transition: { duration: 0.15 } },
};

export default function HRDashboard() {
    const { address, isConnected } = useAccount();
    const [activeTab, setActiveTab] = useState<"treasury" | "create" | "manage" | "compliance">("treasury");

    const { data: isHR } = useReadContract({
        address: CONTRACTS.PAY_STREAM, abi: PAYSTREAM_ABI, functionName: "isHR",
        args: address ? [address] : undefined,
    });
    const { data: isOwner } = useReadContract({
        address: CONTRACTS.PAY_STREAM, abi: PAYSTREAM_ABI, functionName: "owner",
    });
    const hasAccess = isHR || (isOwner && address && isOwner.toLowerCase() === address.toLowerCase());

    const { data: treasuryBalance, refetch: refetchTreasury } = useReadContract({
        address: CONTRACTS.TREASURY, abi: TREASURY_ABI, functionName: "getBalance",
    });
    const { data: taxVaultBalance } = useReadContract({
        address: CONTRACTS.TAX_VAULT, abi: TAX_VAULT_ABI, functionName: "getBalance",
    });
    const { data: employees, refetch: refetchEmployees } = useReadContract({
        address: CONTRACTS.PAY_STREAM, abi: PAYSTREAM_ABI, functionName: "getEmployees",
    });

    const [depositAmount, setDepositAmount] = useState("");
    const [streamForm, setStreamForm] = useState({ employee: "", amount: "", durationDays: "30", taxBps: "1000" });
    const [csvData, setCsvData] = useState<Array<{ address: string; amount: string; days: string }>>([]);
    const [txStatus, setTxStatus] = useState("");

    const { writeContract, data: txHash, isPending } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

    useEffect(() => {
        if (isSuccess) {
            setTxStatus("Transaction confirmed successfully");
            refetchTreasury(); refetchEmployees();
            setTimeout(() => setTxStatus(""), 4000);
        }
    }, [isSuccess, refetchTreasury, refetchEmployees]);

    const handleDeposit = () => {
        if (!depositAmount) return;
        setTxStatus("Approving HLUSD spend...");
        writeContract({ address: CONTRACTS.HLUSD, abi: HLUSD_ABI, functionName: "approve", args: [CONTRACTS.TREASURY, parseEther(depositAmount)] });
    };
    const handleDepositConfirm = () => {
        if (!depositAmount) return;
        setTxStatus("Depositing to treasury...");
        writeContract({ address: CONTRACTS.TREASURY, abi: TREASURY_ABI, functionName: "deposit", args: [parseEther(depositAmount)] });
    };
    const handleCreateStream = () => {
        const { employee, amount, durationDays, taxBps } = streamForm;
        if (!employee || !amount || !durationDays) return;
        const now = Math.floor(Date.now() / 1000);
        setTxStatus("Creating payment stream...");
        writeContract({
            address: CONTRACTS.PAY_STREAM, abi: PAYSTREAM_ABI, functionName: "createStream",
            args: [employee as `0x${string}`, parseEther(amount), BigInt(now), BigInt(now + parseInt(durationDays) * 86400), parseInt(taxBps)],
        });
    };
    const handleBatchCreate = () => {
        if (csvData.length === 0) return;
        const now = Math.floor(Date.now() / 1000);
        setTxStatus("Batch creating streams...");
        writeContract({
            address: CONTRACTS.PAY_STREAM, abi: PAYSTREAM_ABI, functionName: "batchCreateStreams",
            args: [csvData.map(r => r.address as `0x${string}`), csvData.map(r => parseEther(r.amount)),
            csvData.map(() => BigInt(now)), csvData.map(r => BigInt(now + parseInt(r.days) * 86400)), csvData.map(() => 1000)],
        });
    };
    const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]; if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const text = ev.target?.result as string;
            const lines = text.split("\n").filter(l => l.trim());
            setCsvData(lines.slice(1).map(line => {
                const [address, amount, days] = line.split(",").map(s => s.trim());
                return { address, amount, days: days || "30" };
            }));
        };
        reader.readAsText(file);
    };
    const handlePause = (emp: string) => { setTxStatus("Pausing stream..."); writeContract({ address: CONTRACTS.PAY_STREAM, abi: PAYSTREAM_ABI, functionName: "pauseStream", args: [emp as `0x${string}`] }); };
    const handleResume = (emp: string) => { setTxStatus("Resuming stream..."); writeContract({ address: CONTRACTS.PAY_STREAM, abi: PAYSTREAM_ABI, functionName: "resumeStream", args: [emp as `0x${string}`] }); };
    const handleCancel = (emp: string) => { setTxStatus("Canceling stream..."); writeContract({ address: CONTRACTS.PAY_STREAM, abi: PAYSTREAM_ABI, functionName: "cancelStream", args: [emp as `0x${string}`] }); };

    if (!isConnected) {
        return (
            <div className="relative min-h-[70vh] flex items-center justify-center">
                <motion.div className="relative z-10 text-center space-y-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <div className="icon-box icon-box-xl icon-accent mx-auto">
                        <IconBuilding size={28} />
                    </div>
                    <h2 className="text-2xl font-bold text-[var(--text-primary)]">Connect Your Wallet</h2>
                    <p className="text-[var(--text-secondary)] max-w-sm">Connect an HR or Admin wallet to access the payroll dashboard</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="relative">
            <div className="relative z-10 space-y-6">
                {/* Header */}
                <motion.div className="flex items-center justify-between" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                    <div>
                        <h1 className="text-2xl font-bold text-[var(--text-primary)]">HR Dashboard</h1>
                        <p className="text-sm mt-1">
                            {hasAccess ? (
                                <span className="flex items-center gap-2 text-[var(--success)]">
                                    <IconCheck size={14} /> HR Access Verified
                                </span>
                            ) : (
                                <span className="text-[var(--warning)]">No HR Access</span>
                            )}
                        </p>
                    </div>
                    <AnimatePresence>
                        {txStatus && (
                            <motion.div className="toast flex items-center gap-2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
                                {txStatus.includes("confirmed") ? <IconCheck size={14} className="text-[var(--success)]" /> : <IconClock size={14} className="text-[var(--accent)]" />}
                                {txStatus}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Tab Navigation */}
                <motion.div className="flex gap-1 p-1 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-default)] w-fit" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05, duration: 0.4 }}>
                    {TABS.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === tab.key
                                ? "bg-[var(--accent)]/12 text-[var(--accent-light)] shadow-sm"
                                : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                                }`}
                        >
                            <tab.icon size={15} />
                            <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                    ))}
                </motion.div>

                {/* Tab Content */}
                <AnimatePresence mode="wait">
                    {/* ═══ Treasury ═══ */}
                    {activeTab === "treasury" && (
                        <motion.div key="treasury" variants={tabMotion} initial="hidden" animate="visible" exit="exit" className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {/* Balance */}
                            <TiltCard intensity={6}>
                                <div className="card-highlight p-6">
                                    <div className="flex items-center gap-3 mb-5">
                                        <div className="icon-box icon-box-md icon-accent"><IconTreasury size={18} /></div>
                                        <h3 className="font-semibold text-[var(--text-primary)]">Treasury Balance</h3>
                                    </div>
                                    <p className="text-4xl font-bold text-[var(--accent-light)] mb-1 tracking-tight">
                                        {treasuryBalance !== undefined ? Number(formatEther(treasuryBalance)).toLocaleString(undefined, { maximumFractionDigits: 4 }) : "—"}
                                    </p>
                                    <p className="text-sm text-[var(--text-muted)] flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" /> HLUSD available
                                    </p>
                                </div>
                            </TiltCard>

                            {/* Deposit */}
                            <TiltCard intensity={6}>
                                <div className="card p-6">
                                    <div className="flex items-center gap-3 mb-5">
                                        <div className="icon-box icon-box-md icon-success"><IconDownload size={18} /></div>
                                        <h3 className="font-semibold text-[var(--text-primary)]">Deposit Funds</h3>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="relative z-50">
                                            <label className="field-label">Amount (HLUSD)</label>
                                            <input type="number" placeholder="Enter amount" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} className="input-field" />
                                        </div>
                                        <div className="flex gap-3 relative z-50">
                                            <button onClick={handleDeposit} disabled={isPending || isConfirming || !depositAmount} className="flex-1 btn-outline text-sm">
                                                <IconShield size={14} /> 1. Approve
                                            </button>
                                            <button onClick={handleDepositConfirm} disabled={isPending || isConfirming || !depositAmount} className="flex-1 btn-primary text-sm">
                                                <IconDownload size={14} /> 2. Deposit
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </TiltCard>
                        </motion.div>
                    )}

                    {/* ═══ Create ═══ */}
                    {activeTab === "create" && (
                        <motion.div key="create" variants={tabMotion} initial="hidden" animate="visible" exit="exit" className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {/* Single Stream */}
                            <TiltCard intensity={5}>
                                <div className="card p-6">
                                    <div className="flex items-center gap-3 mb-5">
                                        <div className="icon-box icon-box-md icon-accent"><IconStream size={18} /></div>
                                        <div>
                                            <h3 className="font-semibold text-[var(--text-primary)]">Single Stream</h3>
                                            <p className="text-xs text-[var(--text-muted)]">Create one employee stream</p>
                                        </div>
                                    </div>
                                    <div className="space-y-3 relative z-50">
                                        <div>
                                            <label className="field-label">Employee Address</label>
                                            <input placeholder="0x..." value={streamForm.employee} onChange={(e) => setStreamForm({ ...streamForm, employee: e.target.value })} className="input-field font-mono text-sm" />
                                        </div>
                                        <div>
                                            <label className="field-label">Total Amount (HLUSD)</label>
                                            <input type="number" placeholder="1000" value={streamForm.amount} onChange={(e) => setStreamForm({ ...streamForm, amount: e.target.value })} className="input-field" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="field-label">Duration (days)</label>
                                                <input type="number" placeholder="30" value={streamForm.durationDays} onChange={(e) => setStreamForm({ ...streamForm, durationDays: e.target.value })} className="input-field" />
                                            </div>
                                            <div>
                                                <label className="field-label">Tax (bps, 1000 = 10%)</label>
                                                <input type="number" placeholder="1000" value={streamForm.taxBps} onChange={(e) => setStreamForm({ ...streamForm, taxBps: e.target.value })} className="input-field" />
                                            </div>
                                        </div>
                                        <button onClick={handleCreateStream} disabled={isPending || isConfirming} className="w-full btn-primary py-3 text-sm mt-1">
                                            {isPending || isConfirming ? (
                                                <><IconClock size={15} /> Processing...</>
                                            ) : (
                                                <><IconStream size={15} /> Create Stream</>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </TiltCard>

                            {/* Batch */}
                            <TiltCard intensity={5}>
                                <div className="card p-6">
                                    <div className="flex items-center gap-3 mb-5">
                                        <div className="icon-box icon-box-md icon-success"><IconUpload size={18} /></div>
                                        <div>
                                            <h3 className="font-semibold text-[var(--text-primary)]">Batch Create</h3>
                                            <p className="text-xs text-[var(--text-muted)]">CSV upload for multiple employees</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4 relative z-50">
                                        <label htmlFor="csv-upload" className="block border-2 border-dashed border-[var(--border-default)] rounded-xl p-8 text-center cursor-pointer hover:border-[var(--accent)]/30 transition-colors">
                                            <input type="file" accept=".csv" onChange={handleCSVUpload} className="hidden" id="csv-upload" />
                                            <div className="icon-box icon-box-lg icon-muted mx-auto mb-3">
                                                <IconFileText size={22} />
                                            </div>
                                            <p className="text-[var(--text-secondary)] text-sm font-medium">Click to upload CSV</p>
                                            <p className="text-xs text-[var(--text-muted)] mt-1">address, amount, duration_days</p>
                                        </label>

                                        <AnimatePresence>
                                            {csvData.length > 0 && (
                                                <motion.div className="space-y-3" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                                                    <div className="flex items-center gap-2">
                                                        <IconCheck size={14} className="text-[var(--success)]" />
                                                        <p className="text-sm text-[var(--success)] font-medium">{csvData.length} employees loaded</p>
                                                    </div>
                                                    <div className="max-h-28 overflow-y-auto space-y-1.5 bg-[var(--bg-secondary)] rounded-lg p-3">
                                                        {csvData.map((row, i) => (
                                                            <div key={i} className="text-xs text-[var(--text-muted)] font-mono flex justify-between">
                                                                <span>{row.address.slice(0, 10)}...{row.address.slice(-6)}</span>
                                                                <span>{row.amount} HLUSD · {row.days}d</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <button onClick={handleBatchCreate} disabled={isPending || isConfirming} className="w-full btn-success py-3 text-sm">
                                                        {isPending || isConfirming ? <><IconClock size={15} /> Processing...</> : <><IconStream size={15} /> Batch Create {csvData.length} Streams</>}
                                                    </button>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </TiltCard>
                        </motion.div>
                    )}

                    {/* ═══ Manage ═══ */}
                    {activeTab === "manage" && (
                        <motion.div key="manage" variants={tabMotion} initial="hidden" animate="visible" exit="exit" className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="icon-box icon-box-md icon-accent"><IconList size={18} /></div>
                                <div>
                                    <h3 className="font-semibold text-[var(--text-primary)]">Active Streams</h3>
                                    <p className="text-xs text-[var(--text-muted)]">{employees?.length ?? 0} employee{(employees?.length ?? 0) !== 1 ? "s" : ""}</p>
                                </div>
                            </div>

                            {!employees || employees.length === 0 ? (
                                <div className="card p-14 text-center">
                                    <div className="icon-box icon-box-xl icon-muted mx-auto mb-4"><IconList size={24} /></div>
                                    <p className="text-[var(--text-secondary)] font-medium">No streams created yet</p>
                                    <p className="text-sm text-[var(--text-muted)] mt-1">Go to Create Stream tab to start</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {employees.map((emp, i) => (
                                        <motion.div key={emp} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06, duration: 0.35 }}>
                                            <StreamRow employee={emp} onPause={handlePause} onResume={handleResume} onCancel={handleCancel} />
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* ═══ Compliance ═══ */}
                    {activeTab === "compliance" && (
                        <motion.div key="compliance" variants={tabMotion} initial="hidden" animate="visible" exit="exit" className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <TiltCard intensity={6}>
                                <div className="card-highlight p-6">
                                    <div className="flex items-center gap-3 mb-5">
                                        <div className="icon-box icon-box-md icon-warning"><IconScale size={18} /></div>
                                        <h3 className="font-semibold text-[var(--text-primary)]">Tax Vault</h3>
                                    </div>
                                    <div className="space-y-5">
                                        <div>
                                            <p className="field-label">Vault Address</p>
                                            <p className="font-mono text-sm text-[var(--accent)] break-all bg-[var(--bg-secondary)] p-3 rounded-lg">{CONTRACTS.TAX_VAULT}</p>
                                        </div>
                                        <div>
                                            <p className="field-label">Total Withheld</p>
                                            <p className="text-3xl font-bold text-[var(--warning)] tracking-tight">
                                                {taxVaultBalance !== undefined ? Number(formatEther(taxVaultBalance)).toLocaleString(undefined, { maximumFractionDigits: 4 }) : "—"}
                                                <span className="text-base text-[var(--text-muted)] ml-2">HLUSD</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </TiltCard>

                            <TiltCard intensity={6}>
                                <div className="card p-6">
                                    <div className="flex items-center gap-3 mb-5">
                                        <div className="icon-box icon-box-md icon-accent"><IconChart size={18} /></div>
                                        <h3 className="font-semibold text-[var(--text-primary)]">Configuration</h3>
                                    </div>
                                    <div className="space-y-0">
                                        {[
                                            ["Default Tax Rate", "10% (1000 bps)", "text-[var(--success)]"],
                                            ["Maximum Allowed", "50% (5000 bps)", "text-[var(--warning)]"],
                                            ["Applied On", "Each Withdrawal", "text-[var(--accent-light)]"],
                                            ["Vault Type", "Accumulating", "text-[var(--text-primary)]"],
                                        ].map(([label, value, color], i) => (
                                            <div key={i} className="flex justify-between py-3 border-b border-[var(--border-default)] last:border-b-0">
                                                <span className="text-sm text-[var(--text-muted)]">{label}</span>
                                                <span className={`text-sm font-medium ${color}`}>{value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </TiltCard>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

/* ─── Stream Row ───────────────────────────────────── */
function StreamRow({ employee, onPause, onResume, onCancel }: {
    employee: string; onPause: (e: string) => void; onResume: (e: string) => void; onCancel: (e: string) => void;
}) {
    const { data: stream } = useReadContract({
        address: CONTRACTS.PAY_STREAM, abi: PAYSTREAM_ABI, functionName: "getStream", args: [employee as `0x${string}`],
    }) as { data: StreamData | undefined };

    if (!stream || stream.status === 0) return null;
    const status = stream.status;
    const progress = stream.deposited > 0n ? Number((stream.withdrawn * 10000n) / stream.deposited) / 100 : 0;

    return (
        <div className="card p-5">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent)] to-cyan-600 flex items-center justify-center text-xs font-bold text-white">
                        {employee.slice(2, 4).toUpperCase()}
                    </div>
                    <div>
                        <p className="font-mono text-sm text-[var(--text-primary)]">{employee.slice(0, 10)}...{employee.slice(-6)}</p>
                        <div className="flex items-center gap-2 mt-1">
                            <span className={`badge ${STATUS_BADGE[status]}`}>{STATUS_LABELS[status]}</span>
                            <span className="text-xs text-[var(--text-muted)]">{Number(formatEther(stream.deposited)).toLocaleString()} HLUSD</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-xs text-[var(--text-muted)]">Withdrawn</p>
                        <p className="text-sm font-semibold text-[var(--success)]">{Number(formatEther(stream.withdrawn)).toFixed(4)}</p>
                    </div>

                    <div className="w-24">
                        <div className="progress-track">
                            <motion.div className="progress-fill progress-fill-accent" initial={{ width: 0 }} animate={{ width: `${Math.min(progress, 100)}%` }} transition={{ duration: 1 }} />
                        </div>
                        <p className="text-[10px] text-[var(--text-muted)] mt-1 text-center">{progress.toFixed(1)}%</p>
                    </div>

                    <div className="flex gap-1.5">
                        {status === 1 && (
                            <>
                                <button onClick={() => onPause(employee)} className="btn-sm btn-sm-warning"><IconPause size={12} /> Pause</button>
                                <button onClick={() => onCancel(employee)} className="btn-sm btn-sm-danger"><IconX size={12} /> Cancel</button>
                            </>
                        )}
                        {status === 2 && (
                            <>
                                <button onClick={() => onResume(employee)} className="btn-sm btn-sm-success"><IconPlay size={12} /> Resume</button>
                                <button onClick={() => onCancel(employee)} className="btn-sm btn-sm-danger"><IconX size={12} /> Cancel</button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
