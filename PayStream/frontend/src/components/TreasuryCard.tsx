import { useContractRead } from 'wagmi';
import { formatUnits } from 'viem';
import { erc20ABI } from '../abi/erc20';
import { streamManagerABI } from '../abi/streamManager';
import { yieldVaultABI } from '../abi/yieldVault';
import { contracts } from '../contracts';

/** Format a BigInt (18 decimals) to a readable locale string */
const fmt = (v: bigint | undefined) =>
    v != null
        ? parseFloat(formatUnits(v, 18)).toLocaleString(undefined, {
            maximumFractionDigits: 2,
        })
        : '—';

export default function TreasuryCard() {
    const hasStreamMgr = !!contracts.streamManager;
    const hasVault = !!contracts.yieldVault;
    const hasHlusd = !!contracts.hlusd;

    // ── HLUSD balance of StreamManager ──
    const { data: hlusdBalance } = useContractRead({
        address: contracts.hlusd || undefined,
        abi: erc20ABI,
        functionName: 'balanceOf',
        args: hasStreamMgr ? [contracts.streamManager] : undefined,
        enabled: hasHlusd && hasStreamMgr,
        watch: true,
    });

    // ── YieldVault: current balance (principal + yield) ──
    const { data: vaultBalance } = useContractRead({
        address: contracts.yieldVault || undefined,
        abi: yieldVaultABI,
        functionName: 'currentBalance',
        enabled: hasVault,
        watch: true,
    });

    // ── YieldVault: total principal deposited ──
    const { data: totalPrincipal } = useContractRead({
        address: contracts.yieldVault || undefined,
        abi: yieldVaultABI,
        functionName: 'totalPrincipal',
        enabled: hasVault,
        watch: true,
    });

    // ── YieldVault: accumulated yield ──
    const { data: accYield } = useContractRead({
        address: contracts.yieldVault || undefined,
        abi: yieldVaultABI,
        functionName: 'accumulatedYield',
        enabled: hasVault,
        watch: true,
    });

    // ── YieldVault: yield rate BPS ──
    const { data: yieldBps } = useContractRead({
        address: contracts.yieldVault || undefined,
        abi: yieldVaultABI,
        functionName: 'yieldRateBps',
        enabled: hasVault,
        watch: true,
    });

    // ── Stream count from StreamManager ──
    const { data: streamCount } = useContractRead({
        address: contracts.streamManager || undefined,
        abi: streamManagerABI,
        functionName: 'nextStreamId',
        enabled: hasStreamMgr,
        watch: true,
    });

    const yieldPercent =
        yieldBps != null ? (Number(yieldBps) / 100).toFixed(2) : '—';

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Vault Balance */}
            <Card
                emoji="🏦"
                label="Vault Balance"
                value={`${fmt(vaultBalance as bigint | undefined)} HLUSD`}
                sub="Principal + Yield"
            />

            {/* Principal Deposited */}
            <Card
                emoji="💰"
                label="Principal"
                value={`${fmt(totalPrincipal as bigint | undefined)} HLUSD`}
                sub="Total deposited via HR"
            />

            {/* Yield Earned */}
            <Card
                emoji="📈"
                label="Yield Earned"
                value={`${fmt(accYield as bigint | undefined)} HLUSD`}
                sub={`Rate: ${yieldPercent}% / year`}
            />

            {/* Active Streams */}
            <Card
                emoji="🔄"
                label="Active Streams"
                value={streamCount != null ? Number(streamCount).toString() : '—'}
                sub="Total created"
            />
        </div>
    );
}

function Card({
    emoji,
    label,
    value,
    sub,
}: {
    emoji: string;
    label: string;
    value: string;
    sub: string;
}) {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
            <p className="text-sm text-gray-400">
                {emoji} {label}
            </p>
            <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
            <p className="mt-1 text-xs text-gray-500">{sub}</p>
        </div>
    );
}
