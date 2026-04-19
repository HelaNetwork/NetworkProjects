import { useState, useEffect, FormEvent } from 'react';
import {
    useContractWrite,
    useWaitForTransaction,
    useContractRead,
    useAccount,
} from 'wagmi';
import { parseEther } from 'viem';
import { streamManagerABI } from '../abi/streamManager';
import { contracts } from '../contracts';

export default function ScheduleBonusForm() {
    const { isConnected } = useAccount();
    const hasConfig = !!contracts.streamManager;

    const [streamId, setStreamId] = useState('');
    const [amount, setAmount] = useState('');
    const [releaseDate, setReleaseDate] = useState('');
    const [clientError, setClientError] = useState('');

    // ── Fetch total streams to validate stream ID range ──
    const { data: nextStreamId } = useContractRead({
        address: contracts.streamManager || undefined,
        abi: streamManagerABI,
        functionName: 'nextStreamId',
        enabled: hasConfig,
        watch: true,
    });

    const streamCount = Number(nextStreamId ?? 0);
    const parsedId = streamId !== '' ? parseInt(streamId) : NaN;
    const idInRange = !isNaN(parsedId) && parsedId >= 0 && parsedId < streamCount;

    // ── Fetch stream info to check active status & existing bonus ──
    const { data: streamInfo } = useContractRead({
        address: contracts.streamManager || undefined,
        abi: streamManagerABI,
        functionName: 'streamInfo',
        args: idInRange ? [BigInt(parsedId)] : undefined,
        enabled: hasConfig && idInRange,
        watch: true,
    });

    const info = streamInfo as any;
    const isActive = info?.active ?? false;
    const isPaused = info?.paused ?? false;
    const existingBonusAmount = info?.bonusAmount ? Number(info.bonusAmount) : 0;
    const existingBonusClaimed = info?.bonusClaimed ?? true;
    const hasPendingBonus = existingBonusAmount > 0 && !existingBonusClaimed;

    // ── Computed validations ──
    const parsedAmount = parseFloat(amount);
    const amountValid = !isNaN(parsedAmount) && parsedAmount > 0;

    const releaseTimestamp = releaseDate
        ? Math.floor(new Date(releaseDate).getTime() / 1000)
        : 0;
    const releaseInFuture = releaseTimestamp > Math.floor(Date.now() / 1000) + 60; // at least 1 min ahead

    // ── Client-side error messages ──
    useEffect(() => {
        if (streamId !== '' && !isNaN(parsedId)) {
            if (parsedId < 0 || parsedId >= streamCount) {
                setClientError(`Stream #${parsedId} does not exist (max: #${streamCount - 1})`);
                return;
            }
            if (idInRange && info && !isActive) {
                setClientError(`Stream #${parsedId} is cancelled — cannot schedule bonus`);
                return;
            }
            if (idInRange && info && isPaused) {
                setClientError(`Stream #${parsedId} is paused — bonus still allowed but be aware`);
                // Not blocking — contract allows bonus on paused stream
            }
        }
        if (amount && !amountValid) {
            setClientError('Amount must be greater than 0');
            return;
        }
        if (releaseDate && !releaseInFuture) {
            setClientError('Release time must be at least 1 minute in the future');
            return;
        }
        setClientError('');
    }, [streamId, parsedId, streamCount, idInRange, info, isActive, isPaused, amount, amountValid, releaseDate, releaseInFuture]);

    // ── Contract write ──
    const {
        write: scheduleBonus,
        data: txData,
        isLoading: isSending,
        error: writeError,
    } = useContractWrite({
        address: contracts.streamManager || undefined,
        abi: streamManagerABI,
        functionName: 'scheduleBonus',
    });

    const { isLoading: isConfirming, isSuccess } = useWaitForTransaction({
        hash: txData?.hash,
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!scheduleBonus || !canSubmit) return;

        scheduleBonus({
            args: [
                BigInt(parsedId),
                parseEther(amount),
                BigInt(releaseTimestamp),
            ],
        });
    };

    const isWorking = isSending || isConfirming;
    const canSubmit =
        isConnected &&
        hasConfig &&
        idInRange &&
        isActive &&
        amountValid &&
        releaseInFuture &&
        !isWorking &&
        !clientError.includes('cancelled');

    // ── Minimum datetime value (now + 1 min, formatted for datetime-local) ──
    const minDatetime = () => {
        const d = new Date(Date.now() + 60_000);
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
        return d.toISOString().slice(0, 16);
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur"
        >
            <h3 className="text-lg font-semibold">Schedule Bonus</h3>
            <p className="mt-1 text-sm text-gray-500">
                Assign a one-time bonus to an active stream, claimable after the release date.
            </p>

            <div className="mt-5 grid gap-4 sm:grid-cols-3">
                {/* Stream ID */}
                <div>
                    <label className="mb-1 block text-xs text-gray-400">Stream ID</label>
                    <input
                        type="number"
                        min="0"
                        step="1"
                        placeholder="0"
                        value={streamId}
                        onChange={(e) => setStreamId(e.target.value)}
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-hela-500 focus:ring-1 focus:ring-hela-500"
                    />
                    {idInRange && info && (
                        <p className="mt-1 text-xs text-gray-500">
                            Employee: {(info.employee as string)?.slice(0, 6)}…{(info.employee as string)?.slice(-4)}
                            {' · '}
                            <span className={isActive ? (isPaused ? 'text-yellow-400' : 'text-green-400') : 'text-red-400'}>
                                {!isActive ? 'Cancelled' : isPaused ? 'Paused' : 'Active'}
                            </span>
                        </p>
                    )}
                </div>

                {/* Bonus Amount */}
                <div>
                    <label className="mb-1 block text-xs text-gray-400">
                        Bonus Amount (HLUSD)
                    </label>
                    <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="500"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-hela-500 focus:ring-1 focus:ring-hela-500"
                    />
                </div>

                {/* Release Date */}
                <div>
                    <label className="mb-1 block text-xs text-gray-400">
                        Release Date & Time
                    </label>
                    <input
                        type="datetime-local"
                        min={minDatetime()}
                        value={releaseDate}
                        onChange={(e) => setReleaseDate(e.target.value)}
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-hela-500 focus:ring-1 focus:ring-hela-500 [color-scheme:dark]"
                    />
                    {releaseDate && releaseInFuture && (
                        <p className="mt-1 text-xs text-gray-500">
                            Unix: {releaseTimestamp}
                        </p>
                    )}
                </div>
            </div>

            {/* Pending bonus warning */}
            {hasPendingBonus && idInRange && (
                <div className="mt-4 rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-300">
                    ⚠️ Stream #{parsedId} already has a pending bonus. Scheduling a new one will <strong>overwrite</strong> the existing bonus.
                </div>
            )}

            {/* Client validation error */}
            {clientError && !clientError.includes('still allowed') && (
                <p className="mt-3 text-sm text-red-400">
                    ❌ {clientError}
                </p>
            )}

            {/* Contract revert error */}
            {writeError && (
                <p className="mt-3 text-sm text-red-400">
                    ❌ Transaction failed: {(writeError as any)?.shortMessage || writeError.message}
                </p>
            )}

            {/* Submit */}
            <button
                type="submit"
                disabled={!canSubmit}
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
                                : 'Schedule Bonus'}
            </button>

            {isSuccess && (
                <p className="mt-3 text-center text-sm text-green-400">
                    ✅ Bonus scheduled successfully for Stream #{parsedId}!
                </p>
            )}
        </form>
    );
}
