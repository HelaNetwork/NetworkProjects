import { useState, useEffect, FormEvent } from 'react';
import {
    useContractWrite,
    useWaitForTransaction,
    useContractRead,
    useAccount,
} from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { erc20ABI } from '../abi/erc20';
import { streamManagerABI } from '../abi/streamManager';
import { contracts } from '../contracts';

/** Format a BigInt (18 decimals) to a readable locale string */
const fmt = (v: bigint | undefined) =>
    v != null
        ? parseFloat(formatUnits(v, 18)).toLocaleString(undefined, {
            maximumFractionDigits: 4,
        })
        : '—';

export default function AddLiquidityForm() {
    const { address, isConnected } = useAccount();
    const hasStreamMgr = !!contracts.streamManager;
    const hasHlusd = !!contracts.hlusd;

    const [amount, setAmount] = useState('');
    const [step, setStep] = useState<'idle' | 'approving' | 'depositing' | 'done'>('idle');

    // ── Read: user's HLUSD wallet balance ──
    const { data: walletBalance, refetch: refetchBalance } = useContractRead({
        address: contracts.hlusd || undefined,
        abi: erc20ABI,
        functionName: 'balanceOf',
        args: address ? [address] : undefined,
        enabled: hasHlusd && !!address,
        watch: true,
    });

    // ── Read: current allowance for StreamManager ──
    const { data: currentAllowance, refetch: refetchAllowance } = useContractRead({
        address: contracts.hlusd || undefined,
        abi: erc20ABI,
        functionName: 'allowance',
        args: address && hasStreamMgr ? [address, contracts.streamManager] : undefined,
        enabled: hasHlusd && hasStreamMgr && !!address,
        watch: true,
    });

    // ── Parse user input ──
    const parsedAmount = (() => {
        try {
            if (!amount || parseFloat(amount) <= 0) return 0n;
            return parseUnits(amount, 18);
        } catch {
            return 0n;
        }
    })();

    const isValid = parsedAmount > 0n;
    const needsApproval =
        isValid && (currentAllowance == null || (currentAllowance as bigint) < parsedAmount);

    // ── Write: approve HLUSD spending ──
    const {
        write: approve,
        data: approveTxData,
        isLoading: isApproveSending,
        error: approveError,
        reset: resetApprove,
    } = useContractWrite({
        address: contracts.hlusd || undefined,
        abi: erc20ABI,
        functionName: 'approve',
    });

    const { isLoading: isApproveConfirming, isSuccess: isApproveSuccess } =
        useWaitForTransaction({ hash: approveTxData?.hash });

    // ── Write: deposit treasury ──
    const {
        write: depositTreasury,
        data: depositTxData,
        isLoading: isDepositSending,
        error: depositError,
        reset: resetDeposit,
    } = useContractWrite({
        address: contracts.streamManager || undefined,
        abi: streamManagerABI,
        functionName: 'depositTreasury',
    });

    const { isLoading: isDepositConfirming, isSuccess: isDepositSuccess } =
        useWaitForTransaction({ hash: depositTxData?.hash });

    // ── After approval confirms, auto-trigger the deposit ──
    useEffect(() => {
        if (isApproveSuccess && step === 'approving' && parsedAmount > 0n) {
            refetchAllowance();
            setStep('depositing');
            depositTreasury?.({ args: [parsedAmount] });
        }
    }, [isApproveSuccess]);

    // ── After deposit confirms, mark done ──
    useEffect(() => {
        if (isDepositSuccess && step === 'depositing') {
            setStep('done');
            refetchBalance();
            refetchAllowance();
        }
    }, [isDepositSuccess]);

    const isWorking =
        isApproveSending || isApproveConfirming || isDepositSending || isDepositConfirming;

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!isValid || isWorking) return;

        resetApprove();
        resetDeposit();

        if (needsApproval) {
            setStep('approving');
            approve?.({ args: [contracts.streamManager, parsedAmount] });
        } else {
            setStep('depositing');
            depositTreasury?.({ args: [parsedAmount] });
        }
    };

    const handleReset = () => {
        setAmount('');
        setStep('idle');
        resetApprove();
        resetDeposit();
    };

    const handleMaxClick = () => {
        if (walletBalance != null) {
            setAmount(formatUnits(walletBalance as bigint, 18));
        }
    };

    const lastError = approveError || depositError;

    const statusLabel = (() => {
        if (isApproveSending) return '1/2 — Approve in wallet…';
        if (isApproveConfirming) return '1/2 — Confirming approval…';
        if (isDepositSending) return '2/2 — Deposit in wallet…';
        if (isDepositConfirming) return '2/2 — Confirming deposit…';
        if (needsApproval) return 'Approve & Deposit';
        return 'Deposit to Treasury';
    })();

    return (
        <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur"
        >
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold">💧 Add Liquidity</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Deposit HLUSD from your wallet into the YieldVault treasury.
                    </p>
                </div>
                {walletBalance != null && (
                    <div className="text-right">
                        <p className="text-xs text-gray-400">Your HLUSD Balance</p>
                        <p className="text-lg font-bold tracking-tight">
                            {fmt(walletBalance as bigint)}
                        </p>
                    </div>
                )}
            </div>

            <div className="mt-5 flex items-end gap-4">
                <div className="flex-1">
                    <label className="mb-1 block text-xs text-gray-400">
                        Amount (HLUSD)
                    </label>
                    <div className="relative">
                        <input
                            type="number"
                            step="0.0001"
                            min="0"
                            placeholder="1000.00"
                            value={amount}
                            onChange={(e) => {
                                setAmount(e.target.value);
                                if (step === 'done') setStep('idle');
                            }}
                            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 pr-16 text-sm text-white placeholder-gray-600 outline-none focus:border-hela-500 focus:ring-1 focus:ring-hela-500"
                        />
                        <button
                            type="button"
                            onClick={handleMaxClick}
                            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md bg-hela-600/20 px-2.5 py-1 text-xs font-semibold text-hela-400 transition hover:bg-hela-600/40"
                        >
                            MAX
                        </button>
                    </div>
                    {isValid && walletBalance != null && parsedAmount > (walletBalance as bigint) && (
                        <p className="mt-1 text-xs text-yellow-400">
                            ⚠ Exceeds your wallet balance
                        </p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={
                        !isConnected ||
                        !hasStreamMgr ||
                        !hasHlusd ||
                        !isValid ||
                        isWorking
                    }
                    className="rounded-xl bg-hela-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-hela-600/20 transition hover:bg-hela-500 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    {isWorking ? statusLabel : needsApproval ? 'Approve & Deposit' : 'Deposit'}
                </button>
            </div>

            {/* Progress indicator for multi-step */}
            {isWorking && (
                <div className="mt-4 flex items-center gap-3">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                        <div
                            className="h-full rounded-full bg-hela-500 transition-all duration-500"
                            style={{
                                width:
                                    isApproveSending || isApproveConfirming
                                        ? '33%'
                                        : isDepositSending
                                            ? '66%'
                                            : '90%',
                            }}
                        />
                    </div>
                    <span className="text-xs text-gray-400">{statusLabel}</span>
                </div>
            )}

            {lastError && (
                <p className="mt-3 text-sm text-red-400">
                    ❌ {(lastError as any)?.shortMessage || lastError.message}
                </p>
            )}

            {step === 'done' && (
                <div className="mt-3 flex items-center justify-between">
                    <p className="text-sm text-green-400">
                        ✅ Successfully deposited {amount} HLUSD to treasury!
                    </p>
                    <button
                        type="button"
                        onClick={handleReset}
                        className="text-xs text-gray-400 underline hover:text-white"
                    >
                        Deposit more
                    </button>
                </div>
            )}
        </form>
    );
}
