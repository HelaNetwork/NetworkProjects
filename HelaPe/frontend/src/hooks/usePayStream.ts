
import { useReadContract, useWriteContract, useAccount, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
// You might need to import ABI from artifacts if you have generated them, 
// or define it inline for simplicity. Ideally import from blockchain folder if possible or hardcode.
// For now, hardcoding essential parts.

const PAYSTREAM_ABI = [
    {
        inputs: [
            { name: "streamId", type: "uint256" },
            { name: "recipient", type: "address" },
            { name: "ratePerSecond", type: "uint256" },
            { name: "deposit", type: "uint256" },
            { name: "startTime", type: "uint256" }
        ],
        name: "createStream",
        outputs: [{ name: "streamId", type: "uint256" }],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            { name: "streamId", type: "uint256" },
            { name: "amount", type: "uint256" }
        ],
        name: "withdraw",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [{ name: "streamId", type: "uint256" }],
        name: "cancelStream",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [{ name: "streamId", type: "uint256" }],
        name: "pauseStream",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [{ name: "streamId", type: "uint256" }],
        name: "resumeStream",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [{ name: "streamId", type: "uint256" }],
        name: "getStream",
        outputs: [
            {
                components: [
                    { name: "sender", type: "address" },
                    { name: "recipient", type: "address" },
                    { name: "deposit", type: "uint256" },
                    { name: "startTime", type: "uint256" },
                    { name: "stopTime", type: "uint256" },
                    { name: "ratePerSecond", type: "uint256" },
                    { name: "withdrawn", type: "uint256" },
                    { name: "active", type: "bool" },
                    { name: "paused", type: "bool" },
                    { name: "pausedTime", type: "uint256" },
                    { name: "totalPausedDuration", type: "uint256" }
                ],
                internalType: "struct PayStream.Stream",
                name: "",
                type: "tuple"
            }
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [{ name: "streamId", type: "uint256" }],
        name: "getVestedAmount",
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [{ name: "sender", type: "address" }],
        name: "getSenderStreams",
        outputs: [{ name: "", type: "uint256[]" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [{ name: "streamId", type: "uint256" }],
        name: "streamExists",
        outputs: [{ name: "", type: "bool" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            { name: "streamId", type: "uint256" },
            { name: "amount", type: "uint256" },
            { name: "reason", type: "string" }
        ],
        name: "addBonusSpike",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    }
] as const;

export function usePayStream(contractAddress: `0x${string}`, streamId?: bigint) {
    const { writeContract, data: hash, isPending, error } = useWriteContract();
    const { data: receipt, isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

    const createStream = (streamId: bigint, recipient: string, ratePerSecond: bigint, deposit: bigint, startTime: bigint) => {
        writeContract({
            address: contractAddress,
            abi: PAYSTREAM_ABI,
            functionName: 'createStream',
            args: [streamId, recipient as `0x${string}`, ratePerSecond, deposit, startTime],
        });
    };

    const withdraw = (id: bigint, amount: bigint) => {
        console.log("Hook: withdraw called", { id, amount, contractAddress });
        try {
            writeContract({
                address: contractAddress,
                abi: PAYSTREAM_ABI,
                functionName: 'withdraw',
                args: [id, amount],
            });
            console.log("Hook: writeContract called");
        } catch (err) {
            console.error("Hook: withdraw error", err);
        }
    };

    const cancelStream = (id: bigint) => {
        writeContract({
            address: contractAddress,
            abi: PAYSTREAM_ABI,
            functionName: 'cancelStream',
            args: [id],
        });
    };

    const pauseStream = (id: bigint) => {
        writeContract({
            address: contractAddress,
            abi: PAYSTREAM_ABI,
            functionName: 'pauseStream',
            args: [id],
        });
    };

    const resumeStream = (id: bigint) => {
        writeContract({
            address: contractAddress,
            abi: PAYSTREAM_ABI,
            functionName: 'resumeStream',
            args: [id],
        });
    };

    const addBonusSpike = (id: bigint, amount: bigint, reason: string) => {
        writeContract({
            address: contractAddress,
            abi: PAYSTREAM_ABI,
            functionName: 'addBonusSpike',
            args: [id, amount, reason],
        });
    };

    const streamResult = useReadContract({
        address: contractAddress,
        abi: PAYSTREAM_ABI,
        functionName: 'getStream',
        args: streamId !== undefined ? [streamId] : undefined,
        query: {
            enabled: streamId !== undefined && !!contractAddress,
            refetchInterval: 1000, // Refetch every second to show increasing vested amount
            staleTime: 0, // Always consider data stale to force refetch
            gcTime: 0, // Don't cache
            refetchOnWindowFocus: true,
            refetchOnMount: true,
        }
    });

    const vestedResult = useReadContract({
        address: contractAddress,
        abi: PAYSTREAM_ABI,
        functionName: 'getVestedAmount',
        args: streamId !== undefined ? [streamId] : undefined,
        query: {
            enabled: streamId !== undefined && !!contractAddress,
            refetchInterval: 1000, // Refetch every second
            staleTime: 0, // Always consider data stale to force refetch
            gcTime: 0, // Don't cache
            refetchOnWindowFocus: true,
            refetchOnMount: true,
        }
    });

    return {
        createStream,
        withdraw,
        cancelStream,
        pauseStream,
        resumeStream,
        addBonusSpike,
        streamResult,
        vestedResult,
        isPending,
        isConfirming,
        isConfirmed,
        receipt,
        error,
        hash,
    };
}

// New hook for getting sender's streams
export function useSenderStreams(contractAddress: `0x${string}`, senderAddress?: `0x${string}`) {
    return useReadContract({
        address: contractAddress,
        abi: PAYSTREAM_ABI,
        functionName: 'getSenderStreams',
        args: senderAddress ? [senderAddress] : undefined,
        query: {
            enabled: !!senderAddress && !!contractAddress,
        }
    });
}

// New hook for checking if stream exists
export function useStreamExists(contractAddress: `0x${string}`, streamId?: bigint) {
    return useReadContract({
        address: contractAddress,
        abi: PAYSTREAM_ABI,
        functionName: 'streamExists',
        args: streamId !== undefined ? [streamId] : undefined,
        query: {
            enabled: streamId !== undefined && !!contractAddress,
        }
    });
}
