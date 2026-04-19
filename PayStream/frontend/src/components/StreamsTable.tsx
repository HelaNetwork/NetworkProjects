import { useContractRead, useContractReads } from 'wagmi';
import { formatUnits } from 'viem';
import { streamManagerABI } from '../abi/streamManager';
import { contracts } from '../contracts';

/** Format bigint wei → human-readable HLUSD string */
const fmt = (val: unknown) =>
    val !== undefined && val !== null
        ? Number(formatUnits(val as bigint, 18)).toLocaleString(undefined, {
            maximumFractionDigits: 4,
        })
        : '—';

/** Truncate an address to 0x1234…abcd */
const shorten = (addr: string) => `${addr.slice(0, 6)}…${addr.slice(-4)}`;

export default function StreamsTable() {
    const hasConfig = !!contracts.streamManager;

    // Total streams count
    const { data: nextStreamId } = useContractRead({
        address: contracts.streamManager || undefined,
        abi: streamManagerABI,
        functionName: 'nextStreamId',
        enabled: hasConfig,
        watch: true,
    });

    const streamCount = Number(nextStreamId ?? 0);

    // Build multicall for streamInfo, accruedSalary, netWithdrawable per stream
    const streamIds = Array.from({ length: streamCount }, (_, i) => i);

    const smAddr = contracts.streamManager || undefined;

    const { data: multicallData, isLoading } = useContractReads({
        contracts: streamIds.flatMap((id) => [
            {
                address: smAddr,
                abi: streamManagerABI,
                functionName: 'streamInfo' as const,
                args: [BigInt(id)],
            },
            {
                address: smAddr,
                abi: streamManagerABI,
                functionName: 'accruedSalary' as const,
                args: [BigInt(id)],
            },
            {
                address: smAddr,
                abi: streamManagerABI,
                functionName: 'netWithdrawable' as const,
                args: [BigInt(id)],
            },
        ]),
        enabled: hasConfig && streamCount > 0,
        watch: true,
    });

    // Each stream has 3 results (info, accrued, net)
    const streams = streamIds.map((id) => {
        const base = id * 3;
        const info = multicallData?.[base]?.result as any;
        const accrued = multicallData?.[base + 1]?.result as bigint | undefined;
        const net = multicallData?.[base + 2]?.result as bigint | undefined;
        return { id, info, accrued, net };
    });

    if (!hasConfig) {
        return (
            <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center text-gray-500">
                <p>Set <code>VITE_STREAMMANAGER_ADDRESS</code> to view streams.</p>
            </div>
        );
    }

    if (streamCount === 0) {
        return (
            <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center text-gray-500">
                <p className="text-lg font-medium">No streams yet</p>
                <p className="mt-1 text-sm">Create one above to get started.</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5 backdrop-blur">
            <table className="w-full text-left text-sm">
                <thead>
                    <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-gray-500">
                        <th className="px-4 py-3">ID</th>
                        <th className="px-4 py-3">Employee</th>
                        <th className="px-4 py-3">Rate / sec</th>
                        <th className="px-4 py-3">Tax</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Bonus</th>
                        <th className="px-4 py-3 text-right">Accrued</th>
                        <th className="px-4 py-3 text-right">Net Withdrawable</th>
                    </tr>
                </thead>
                <tbody>
                    {isLoading
                        ? Array.from({ length: streamCount }, (_, i) => (
                            <tr key={i} className="border-b border-white/5">
                                <td colSpan={8} className="px-4 py-3">
                                    <div className="h-4 w-full animate-pulse rounded bg-white/5" />
                                </td>
                            </tr>
                        ))
                        : streams.map(({ id, info, accrued, net }) => {
                            const active = info?.active ?? false;
                            const paused = info?.paused ?? false;
                            const status = !active
                                ? 'Cancelled'
                                : paused
                                    ? 'Paused'
                                    : 'Active';
                            const statusColor = !active
                                ? 'text-red-400'
                                : paused
                                    ? 'text-yellow-400'
                                    : 'text-green-400';

                            return (
                                <tr
                                    key={id}
                                    className="border-b border-white/5 transition hover:bg-white/[0.02]"
                                >
                                    <td className="px-4 py-3 font-mono text-gray-400">#{id}</td>
                                    <td className="px-4 py-3 font-mono text-xs text-gray-300">
                                        {info?.employee ? shorten(info.employee) : '—'}
                                    </td>
                                    <td className="px-4 py-3">
                                        {info?.ratePerSecond !== undefined
                                            ? fmt(info.ratePerSecond)
                                            : '—'}
                                    </td>
                                    <td className="px-4 py-3">
                                        {info?.taxBps !== undefined
                                            ? `${(Number(info.taxBps) / 100).toFixed(2)}%`
                                            : '—'}
                                    </td>
                                    <td className={`px-4 py-3 font-medium ${statusColor}`}>
                                        {status}
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                        {(() => {
                                            const bonusAmt = info?.bonusAmount ? Number(info.bonusAmount) : 0;
                                            if (bonusAmt === 0) return <span className="text-gray-600">—</span>;
                                            const claimed = info?.bonusClaimed;
                                            const releaseTs = Number(info?.bonusReleaseTime ?? 0);
                                            const now = Math.floor(Date.now() / 1000);
                                            const amtStr = fmt(info.bonusAmount);
                                            const dateStr = new Date(releaseTs * 1000).toLocaleDateString();
                                            if (claimed) return <span className="text-gray-400">{amtStr} ✅</span>;
                                            if (now >= releaseTs) return <span className="text-green-400">{amtStr} 🔓</span>;
                                            return <span className="text-yellow-400">{amtStr} ⏳ {dateStr}</span>;
                                        })()}
                                    </td>
                                    <td className="px-4 py-3 text-right font-mono">
                                        {fmt(accrued)}
                                    </td>
                                    <td className="px-4 py-3 text-right font-mono text-hela-400">
                                        {fmt(net)}
                                    </td>
                                </tr>
                            );
                        })}
                </tbody>
            </table>
        </div>
    );
}
