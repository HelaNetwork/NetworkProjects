import { useState, FormEvent } from 'react';
import { useContractWrite, useWaitForTransaction, useAccount } from 'wagmi';
import { parseEther } from 'viem';
import { streamManagerABI } from '../abi/streamManager';
import { contracts } from '../contracts';

export default function CreateStreamForm() {
    const { isConnected } = useAccount();
    const [employee, setEmployee] = useState('');
    const [ratePerMonth, setRatePerMonth] = useState('');
    const [taxBps, setTaxBps] = useState('500');

    // Convert monthly HLUSD rate to wei-per-second
    const ratePerSecond = ratePerMonth
        ? parseEther(ratePerMonth) / BigInt(30 * 24 * 3600)
        : BigInt(0);

    const {
        write: createStream,
        data: txData,
        isLoading: isSending,
    } = useContractWrite({
        address: contracts.streamManager || undefined,
        abi: streamManagerABI,
        functionName: 'createStream',
    });

    const { isLoading: isConfirming, isSuccess } = useWaitForTransaction({
        hash: txData?.hash,
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!createStream) return;
        createStream({
            args: [employee as `0x${string}`, ratePerSecond, parseInt(taxBps)],
        });
    };

    const isWorking = isSending || isConfirming;
    const hasConfig = !!contracts.streamManager;

    return (
        <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur"
        >
            <h3 className="text-lg font-semibold">Create Stream</h3>
            <p className="mt-1 text-sm text-gray-500">
                Set up a new salary stream for an employee.
            </p>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {/* Employee address */}
                <div className="sm:col-span-2">
                    <label className="mb-1 block text-xs text-gray-400">Employee Address</label>
                    <input
                        type="text"
                        placeholder="0x…"
                        value={employee}
                        onChange={(e) => setEmployee(e.target.value)}
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-hela-500 focus:ring-1 focus:ring-hela-500"
                    />
                </div>

                {/* Monthly rate */}
                <div>
                    <label className="mb-1 block text-xs text-gray-400">
                        Monthly Rate (HLUSD)
                    </label>
                    <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="5000"
                        value={ratePerMonth}
                        onChange={(e) => setRatePerMonth(e.target.value)}
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-hela-500 focus:ring-1 focus:ring-hela-500"
                    />
                    {ratePerMonth && (
                        <p className="mt-1 text-xs text-gray-500">
                            ≈ {(Number(ratePerMonth) / (30 * 24 * 3600)).toFixed(8)} HLUSD / sec
                        </p>
                    )}
                </div>

                {/* Tax BPS */}
                <div>
                    <label className="mb-1 block text-xs text-gray-400">
                        Tax (basis points)
                    </label>
                    <input
                        type="number"
                        min="0"
                        max="10000"
                        placeholder="500"
                        value={taxBps}
                        onChange={(e) => setTaxBps(e.target.value)}
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-hela-500 focus:ring-1 focus:ring-hela-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                        {(parseInt(taxBps || '0') / 100).toFixed(2)}%
                    </p>
                </div>
            </div>

            {/* Submit */}
            <button
                type="submit"
                disabled={!isConnected || !hasConfig || isWorking || !employee || !ratePerMonth}
                className="mt-6 w-full rounded-xl bg-hela-600 py-3 text-sm font-semibold text-white shadow-lg shadow-hela-600/20 transition hover:bg-hela-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
                {!isConnected
                    ? 'Connect Wallet'
                    : !hasConfig
                        ? 'Configure Contract Address'
                        : isSending
                            ? 'Confirm in Wallet…'
                            : isConfirming
                                ? 'Confirming…'
                                : 'Create Stream'}
            </button>

            {isSuccess && (
                <p className="mt-3 text-center text-sm text-green-400">
                    ✅ Stream created successfully!
                </p>
            )}
        </form>
    );
}
