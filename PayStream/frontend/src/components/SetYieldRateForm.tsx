import { useState, FormEvent } from 'react';
import {
    useContractWrite,
    useWaitForTransaction,
    useContractRead,
    useAccount,
} from 'wagmi';
import { yieldVaultABI } from '../abi/yieldVault';
import { contracts } from '../contracts';

export default function SetYieldRateForm() {
    const { isConnected } = useAccount();
    const hasVault = !!contracts.yieldVault;
    const [ratePct, setRatePct] = useState('');

    // Current rate
    const { data: currentBps } = useContractRead({
        address: contracts.yieldVault || undefined,
        abi: yieldVaultABI,
        functionName: 'yieldRateBps',
        enabled: hasVault,
        watch: true,
    });

    const currentPct =
        currentBps != null ? (Number(currentBps) / 100).toFixed(2) : '—';

    // Write
    const {
        write: setYieldRate,
        data: txData,
        isLoading: isSending,
        error: writeError,
    } = useContractWrite({
        address: contracts.yieldVault || undefined,
        abi: yieldVaultABI,
        functionName: 'setYieldRate',
    });

    const { isLoading: isConfirming, isSuccess } = useWaitForTransaction({
        hash: txData?.hash,
    });

    const parsedPct = parseFloat(ratePct);
    const bpsValue = !isNaN(parsedPct) ? Math.round(parsedPct * 100) : 0;
    const isValid = !isNaN(parsedPct) && parsedPct >= 0 && parsedPct <= 100;
    const isWorking = isSending || isConfirming;

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!setYieldRate || !isValid) return;
        setYieldRate({ args: [BigInt(bpsValue)] });
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur"
        >
            <h3 className="text-lg font-semibold">Set Yield Rate</h3>
            <p className="mt-1 text-sm text-gray-500">
                Current rate: <span className="text-white font-medium">{currentPct}%</span> / year
            </p>

            <div className="mt-5 flex items-end gap-4">
                <div className="flex-1">
                    <label className="mb-1 block text-xs text-gray-400">
                        New Yield Rate (%)
                    </label>
                    <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        placeholder="5.00"
                        value={ratePct}
                        onChange={(e) => setRatePct(e.target.value)}
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-hela-500 focus:ring-1 focus:ring-hela-500"
                    />
                    {ratePct && isValid && (
                        <p className="mt-1 text-xs text-gray-500">
                            = {bpsValue} basis points
                        </p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={!isConnected || !hasVault || !isValid || isWorking || !ratePct}
                    className="rounded-xl bg-hela-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-hela-600/20 transition hover:bg-hela-500 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    {isSending
                        ? 'Confirm…'
                        : isConfirming
                            ? 'Confirming…'
                            : 'Update Rate'}
                </button>
            </div>

            {writeError && (
                <p className="mt-3 text-sm text-red-400">
                    ❌ {(writeError as any)?.shortMessage || writeError.message}
                </p>
            )}

            {isSuccess && (
                <p className="mt-3 text-sm text-green-400">
                    ✅ Yield rate updated to {ratePct}%!
                </p>
            )}
        </form>
    );
}
