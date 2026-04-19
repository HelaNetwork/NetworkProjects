import { useState } from 'react';
import {
    useAccount,
    useContractRead,
    useContractReads,
    useContractWrite,
    useWaitForTransaction,
    useNetwork,
    useWalletClient,
} from 'wagmi';
import { streamManagerABI } from '../abi/streamManager';
import { contracts } from '../contracts';

interface Props {
    /** If provided, withdraw from this specific stream. Otherwise finds first active stream. */
    streamId?: number;
}

export default function WithdrawButton({ streamId }: Props) {
    const { address, isConnected } = useAccount();
    const { chain } = useNetwork();
    const { data: walletClient } = useWalletClient();
    const [mode, setMode] = useState<'direct' | 'signed'>('direct');
    const hasConfig = !!contracts.streamManager && isConnected;

    // Find the employee's stream if not specified
    const { data: nextStreamId } = useContractRead({
        address: contracts.streamManager || undefined,
        abi: streamManagerABI,
        functionName: 'nextStreamId',
        enabled: hasConfig && streamId === undefined,
    });

    const totalStreams = Number(nextStreamId ?? 0);
    const streamIds = Array.from({ length: totalStreams }, (_, i) => i);
    const smAddr = contracts.streamManager || undefined;

    const { data: allInfos } = useContractReads({
        contracts: streamIds.map((id) => ({
            address: smAddr,
            abi: streamManagerABI,
            functionName: 'streamInfo' as const,
            args: [BigInt(id)],
        })),
        enabled: hasConfig && streamId === undefined && totalStreams > 0,
    });

    // Determine which stream to withdraw from
    let targetStreamId = streamId;
    if (targetStreamId === undefined && allInfos) {
        for (let i = 0; i < allInfos.length; i++) {
            const info = allInfos[i]?.result as any;
            if (
                info &&
                info.employee?.toLowerCase() === address?.toLowerCase() &&
                info.active &&
                !info.paused
            ) {
                targetStreamId = i;
                break;
            }
        }
    }

    // ── Direct withdraw ──
    const {
        write: directWithdraw,
        data: directTx,
        isLoading: directSending,
    } = useContractWrite({
        address: smAddr,
        abi: streamManagerABI,
        functionName: 'withdraw',
    });

    const { isLoading: directConfirming, isSuccess: directSuccess } =
        useWaitForTransaction({ hash: directTx?.hash });

    // ── EIP-712 signed withdraw ──
    const { data: nonce } = useContractRead({
        address: smAddr,
        abi: streamManagerABI,
        functionName: 'nonces',
        args: address ? [address] : undefined,
        enabled: hasConfig && mode === 'signed',
        watch: true,
    });

    const [signedPayload, setSignedPayload] = useState<string | null>(null);
    const [signing, setSigning] = useState(false);

    const handleSignedWithdraw = async () => {
        if (targetStreamId === undefined || !address || !chain) return;
        setSigning(true);

        try {
            const deadline = Math.floor(Date.now() / 1000) + 600; // 10 min
            const currentNonce = Number(nonce ?? 0);

            const domain = {
                name: 'PayStream',
                version: '1',
                chainId: chain.id,
                verifyingContract: contracts.streamManager as `0x${string}`,
            };

            const types = {
                WithdrawPayload: [
                    { name: 'streamId', type: 'uint256' },
                    { name: 'nonce', type: 'uint256' },
                    { name: 'deadline', type: 'uint256' },
                ],
            };

            const value = {
                streamId: targetStreamId,
                nonce: currentNonce,
                deadline,
            };

            // Request EIP-712 signature from wallet
            if (!walletClient) throw new Error('No wallet client');

            const signature = await walletClient.signTypedData({
                account: address,
                domain,
                types,
                primaryType: 'WithdrawPayload',
                message: value,
            });

            // Build the payload for a relayer
            const payload = JSON.stringify(
                {
                    streamId: targetStreamId,
                    nonce: currentNonce,
                    deadline,
                    relayerFee: '0',
                    signature,
                    contract: contracts.streamManager,
                    chainId: chain.id,
                },
                null,
                2,
            );

            setSignedPayload(payload);
        } catch (err) {
            console.error('Signing failed:', err);
        } finally {
            setSigning(false);
        }
    };

    const handleDirect = () => {
        if (targetStreamId === undefined || !directWithdraw) return;
        directWithdraw({ args: [BigInt(targetStreamId)] });
    };

    const isWorking = directSending || directConfirming || signing;
    const noStream = targetStreamId === undefined;

    return (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <h3 className="text-lg font-semibold">Withdraw Earnings</h3>
            <p className="mt-1 text-sm text-gray-500">
                {noStream
                    ? 'No active stream found for your wallet'
                    : `Stream #${targetStreamId}`}
            </p>

            {/* Mode toggle */}
            <div className="mt-4 flex rounded-lg border border-white/10 text-sm">
                <button
                    type="button"
                    onClick={() => setMode('direct')}
                    className={`flex-1 px-4 py-2 transition rounded-l-lg ${mode === 'direct'
                        ? 'bg-hela-600 text-white'
                        : 'text-gray-400 hover:text-white'
                        }`}
                >
                    Direct
                </button>
                <button
                    type="button"
                    onClick={() => setMode('signed')}
                    className={`flex-1 px-4 py-2 transition rounded-r-lg ${mode === 'signed'
                        ? 'bg-hela-600 text-white'
                        : 'text-gray-400 hover:text-white'
                        }`}
                >
                    Gasless (EIP-712)
                </button>
            </div>

            {/* Action button */}
            {mode === 'direct' ? (
                <button
                    type="button"
                    onClick={handleDirect}
                    disabled={!isConnected || noStream || isWorking}
                    className="mt-4 w-full rounded-xl bg-green-600 py-3 text-sm font-semibold text-white shadow-lg shadow-green-600/20 transition hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    {directSending
                        ? 'Confirm in Wallet…'
                        : directConfirming
                            ? 'Confirming…'
                            : 'Withdraw Now'}
                </button>
            ) : (
                <button
                    type="button"
                    onClick={handleSignedWithdraw}
                    disabled={!isConnected || noStream || isWorking}
                    className="mt-4 w-full rounded-xl bg-purple-600 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-600/20 transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    {signing ? 'Signing…' : 'Sign Withdraw (Gasless)'}
                </button>
            )}

            {/* Success states */}
            {directSuccess && (
                <p className="mt-3 text-center text-sm text-green-400">
                    ✅ Withdrawal successful!
                </p>
            )}

            {/* Signed payload display */}
            {signedPayload && mode === 'signed' && (
                <div className="mt-4">
                    <p className="mb-2 text-xs text-gray-500">
                        Signed payload — send to a relayer or submit directly:
                    </p>
                    <pre className="max-h-40 overflow-auto rounded-lg border border-white/10 bg-black/40 p-3 text-xs text-gray-300">
                        {signedPayload}
                    </pre>
                    <button
                        type="button"
                        onClick={() => navigator.clipboard.writeText(signedPayload)}
                        className="mt-2 text-xs text-hela-400 hover:text-hela-300"
                    >
                        📋 Copy to clipboard
                    </button>
                </div>
            )}
        </div>
    );
}
