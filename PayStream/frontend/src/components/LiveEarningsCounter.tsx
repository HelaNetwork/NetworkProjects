import { useEffect, useState, useCallback } from 'react';
import { useContractRead, useContractReads, useAccount } from 'wagmi';
import { formatUnits } from 'viem';
import { streamManagerABI } from '../abi/streamManager';
import { contracts } from '../contracts';

interface StreamData {
    id: number;
    ratePerSecond: bigint;
    lastCheckpoint: bigint;
    taxBps: number;
    active: boolean;
    paused: boolean;
    bonusAmount: bigint;
    bonusReleaseTime: bigint;
    bonusClaimed: boolean;
}

/**
 * Locally ticking earnings counter per stream.
 * Reads on-chain data once, then computes accrual client-side every 100ms.
 */
export default function LiveEarningsCounter() {
    const { address, isConnected } = useAccount();
    const hasConfig = !!contracts.streamManager && isConnected;

    // Get total stream count
    const { data: nextStreamId } = useContractRead({
        address: contracts.streamManager || undefined,
        abi: streamManagerABI,
        functionName: 'nextStreamId',
        enabled: hasConfig,
        watch: true,
    });

    const totalStreams = Number(nextStreamId ?? 0);
    const streamIds = Array.from({ length: totalStreams }, (_, i) => i);
    const smAddr = contracts.streamManager || undefined;

    // Fetch all stream infos
    const { data: multicallData } = useContractReads({
        contracts: streamIds.map((id) => ({
            address: smAddr,
            abi: streamManagerABI,
            functionName: 'streamInfo' as const,
            args: [BigInt(id)],
        })),
        enabled: hasConfig && totalStreams > 0,
        watch: true,
    });

    // Filter streams belonging to this employee
    const myStreams: StreamData[] = [];
    if (multicallData) {
        for (let i = 0; i < multicallData.length; i++) {
            const info = multicallData[i]?.result as any;
            if (
                info &&
                info.employee?.toLowerCase() === address?.toLowerCase() &&
                info.active &&
                !info.paused
            ) {
                myStreams.push({
                    id: i,
                    ratePerSecond: info.ratePerSecond as bigint,
                    lastCheckpoint: info.lastCheckpoint as bigint,
                    taxBps: Number(info.taxBps),
                    active: info.active,
                    paused: info.paused,
                    bonusAmount: info.bonusAmount as bigint,
                    bonusReleaseTime: info.bonusReleaseTime as bigint,
                    bonusClaimed: info.bonusClaimed,
                });
            }
        }
    }

    // ── Live ticker ──
    const [now, setNow] = useState(Math.floor(Date.now() / 1000));

    useEffect(() => {
        const timer = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 100);
        return () => clearInterval(timer);
    }, []);

    // Compute totals across all employee streams
    const compute = useCallback(() => {
        let totalGross = BigInt(0);
        let totalTax = BigInt(0);
        let totalBonus = BigInt(0);

        for (const s of myStreams) {
            const elapsed = BigInt(now) - s.lastCheckpoint;
            const accrued = elapsed > 0 ? s.ratePerSecond * elapsed : BigInt(0);

            let bonus = BigInt(0);
            if (
                s.bonusAmount > BigInt(0) &&
                BigInt(now) >= s.bonusReleaseTime &&
                !s.bonusClaimed
            ) {
                bonus = s.bonusAmount;
            }

            const gross = accrued + bonus;
            const tax = (gross * BigInt(s.taxBps)) / BigInt(10000);

            totalGross += gross;
            totalTax += tax;
            totalBonus += bonus;
        }

        const totalNet = totalGross - totalTax;
        return { totalGross, totalTax, totalNet, totalBonus };
    }, [myStreams, now]);

    const { totalGross, totalTax, totalNet, totalBonus } = compute();

    const fmt = (val: bigint) =>
        Number(formatUnits(val, 18)).toLocaleString(undefined, {
            minimumFractionDigits: 6,
            maximumFractionDigits: 6,
        });

    if (!isConnected) {
        return (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur">
                <p className="text-gray-500">Connect wallet to view earnings</p>
            </div>
        );
    }

    if (myStreams.length === 0) {
        return (
            <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center backdrop-blur">
                <p className="text-gray-500">No active streams found for your address</p>
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-hela-950/50 to-gray-900/50 p-8 backdrop-blur">
            {/* Large live counter */}
            <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                Live Net Earnings
            </p>
            <p className="mt-2 bg-gradient-to-r from-hela-400 to-cyan-400 bg-clip-text font-mono text-4xl font-extrabold tabular-nums text-transparent sm:text-5xl">
                {fmt(totalNet)}
            </p>
            <p className="mt-1 text-sm text-gray-500">
                HLUSD · {myStreams.length} active stream{myStreams.length > 1 ? 's' : ''}
            </p>

            {/* Breakdown */}
            <div className="mt-6 grid gap-4 sm:grid-cols-4">
                <div>
                    <p className="text-xs uppercase tracking-wider text-gray-500">Gross</p>
                    <p className="mt-1 font-mono text-lg font-semibold">{fmt(totalGross)}</p>
                </div>
                <div>
                    <p className="text-xs uppercase tracking-wider text-gray-500">Tax</p>
                    <p className="mt-1 font-mono text-lg font-semibold text-red-400">
                        −{fmt(totalTax)}
                    </p>
                </div>
                <div>
                    <p className="text-xs uppercase tracking-wider text-gray-500">Net</p>
                    <p className="mt-1 font-mono text-lg font-semibold text-green-400">
                        {fmt(totalNet)}
                    </p>
                </div>
                <div>
                    <p className="text-xs uppercase tracking-wider text-gray-500">Bonus</p>
                    <p className="mt-1 font-mono text-lg font-semibold text-yellow-400">
                        {totalBonus > BigInt(0) ? `+${fmt(totalBonus)}` : '—'}
                    </p>
                </div>
            </div>
        </div>
    );
}
