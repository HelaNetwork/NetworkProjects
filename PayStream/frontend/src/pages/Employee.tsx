import { useAccount, useContractRead } from 'wagmi';
import { useHLUSDBalance } from '../hooks/useHLUSDBalance';
import { formatUnits } from 'viem';
import LiveEarningsCounter from '../components/LiveEarningsCounter';
import WithdrawButton from '../components/WithdrawButton';
import { yieldVaultABI } from '../abi/yieldVault';
import { contracts } from '../contracts';

/** Format a BigInt (18 decimals) to a readable locale string */
const fmt = (v: bigint | undefined) =>
    v != null
        ? parseFloat(formatUnits(v, 18)).toLocaleString(undefined, {
            maximumFractionDigits: 2,
        })
        : '—';

export default function Employee() {
    const { address, isConnected } = useAccount();
    const { balance, isLoading, isConfigured } = useHLUSDBalance();
    const hasVault = !!contracts.yieldVault;

    // ── YieldVault reads ──
    const { data: vaultBalance } = useContractRead({
        address: contracts.yieldVault || undefined,
        abi: yieldVaultABI,
        functionName: 'currentBalance',
        enabled: hasVault,
        watch: true,
    });

    const { data: yieldBps } = useContractRead({
        address: contracts.yieldVault || undefined,
        abi: yieldVaultABI,
        functionName: 'yieldRateBps',
        enabled: hasVault,
        watch: true,
    });

    const yieldPercent =
        yieldBps != null ? (Number(yieldBps) / 100).toFixed(2) : '—';

    return (
        <div className="mx-auto max-w-5xl px-6 py-16">
            <h1 className="text-3xl font-bold tracking-tight">💼 Employee Portal</h1>
            <p className="mt-2 text-gray-400">
                View your streams, accrued salary, and withdraw funds.
            </p>

            {/* ── Vault Liquidity Banner ─────────────────────────── */}
            <div className="mt-8 flex items-center gap-3 rounded-xl border border-hela-500/20 bg-hela-500/5 px-5 py-3">
                <span className="text-xl">🛡️</span>
                <div>
                    <p className="text-sm font-medium text-hela-400">
                        Backed by YieldVault Liquidity
                    </p>
                    <p className="text-xs text-gray-500">
                        Vault Balance: <span className="text-white font-medium">{fmt(vaultBalance as bigint | undefined)} HLUSD</span>
                        {' · '}
                        Projected Yield: <span className="text-green-400 font-medium">{yieldPercent}%</span> / year
                    </p>
                </div>
            </div>

            {/* ── Wallet + Balance ─────────────────────────────── */}
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                    <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                        Connected Wallet
                    </p>
                    <p className="mt-3 font-mono text-sm text-gray-300">
                        {isConnected ? address : <span className="text-gray-500">Not connected</span>}
                    </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                    <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                        HLUSD Balance
                    </p>
                    <p className="mt-3 text-2xl font-bold">
                        {!isConnected ? (
                            <span className="text-gray-500">—</span>
                        ) : !isConfigured ? (
                            <span className="text-yellow-400 text-base">Set VITE_HLUSD_ADDRESS</span>
                        ) : isLoading ? (
                            <span className="animate-pulse text-gray-500">Loading…</span>
                        ) : balance !== undefined ? (
                            <>{Number(formatUnits(balance, 18)).toLocaleString()} HLUSD</>
                        ) : (
                            <span className="text-gray-500">—</span>
                        )}
                    </p>
                </div>
            </div>

            {/* ── Live Earnings Counter ────────────────────────── */}
            <div className="mt-10">
                <h2 className="mb-4 text-xl font-semibold">Live Earnings</h2>
                <LiveEarningsCounter />
            </div>

            {/* ── Withdraw ─────────────────────────────────────── */}
            <div className="mt-10">
                <h2 className="mb-4 text-xl font-semibold">Withdraw</h2>
                <WithdrawButton />
            </div>

            {/* ── Off-Ramp to Fiat ────────────────────────────── */}
            <div className="mt-10">
                <h2 className="mb-4 text-xl font-semibold">Off-Ramp to Fiat</h2>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                    <p className="text-sm text-gray-400 mb-4">
                        Convert your HLUSD to fiat currency (USD, EUR, INR, etc.)
                        directly to your bank account.
                    </p>
                    <button
                        onClick={() => {
                            const params = new URLSearchParams({
                                apiKey: 'your-transak-api-key',
                                cryptoCurrencyCode: 'HLUSD',
                                network: 'hela',
                                walletAddress: address || '',
                                defaultCryptoAmount: '100',
                                productsAvailed: 'SELL',
                            });
                            window.open(
                                `https://global.transak.com/?${params.toString()}`,
                                '_blank',
                                'noopener,noreferrer'
                            );
                        }}
                        disabled={!isConnected}
                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-green-500/20 transition hover:shadow-green-500/40 hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <span className="text-lg">💱</span>
                        Cash Out to Bank
                    </button>
                    <p className="mt-3 text-xs text-gray-600">
                        Powered by Transak · KYC may be required
                    </p>
                </div>
            </div>
        </div>
    );
}
