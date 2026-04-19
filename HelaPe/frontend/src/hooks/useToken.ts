import { useReadContract, useWriteContract, useAccount, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { useEffect } from 'react';

// Ensure you replace this with the actual ABI of your ERC20 token
const ERC20_ABI = [
    {
        constant: true,
        inputs: [{ name: "_owner", type: "address" }],
        name: "balanceOf",
        outputs: [{ name: "balance", type: "uint256" }],
        payable: false,
        stateMutability: "view",
        type: "function",
    },
    {
        constant: false,
        inputs: [
            { name: "_spender", type: "address" },
            { name: "_value", type: "uint256" },
        ],
        name: "approve",
        outputs: [{ name: "", type: "bool" }],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        constant: true,
        inputs: [
            { name: "_owner", type: "address" },
            { name: "_spender", type: "address" },
        ],
        name: "allowance",
        outputs: [{ name: "", type: "uint256" }],
        payable: false,
        stateMutability: "view",
        type: "function",
    },
    {
        constant: false,
        inputs: [
            { name: "to", type: "address" },
            { name: "amount", type: "uint256" },
        ],
        name: "mint",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
    },
] as const;

export function useToken(tokenAddress: `0x${string}`, spenderAddress?: `0x${string}`) {
    const { address } = useAccount();
    const { writeContract, data: hash, isPending, isSuccess, error } = useWriteContract();
    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

    // Read balance
    const balanceResult = useReadContract({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: address ? [address] : undefined,
        query: {
            enabled: !!address && !!tokenAddress,
        }
    });

    // Read allowance
    const allowanceResult = useReadContract({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: 'allowance',
        args: address && spenderAddress ? [address, spenderAddress] : undefined,
        query: {
            enabled: !!address && !!tokenAddress && !!spenderAddress,
        }
    });

    // Monitor for errors
    useEffect(() => {
        if (error) {
            console.error('🔴 Transaction Error:', error);
        }
        if (isPending) {
            console.log('⏳ Transaction pending... (wallet should popup now)');
        }
        if (isConfirming) {
            console.log('⏳ Transaction confirming...');
        }
        if (isConfirmed) {
            console.log('✅ Transaction confirmed!');
        }
    }, [error, isPending, isConfirming, isConfirmed]);

    // Approve function
    const approve = (amount: bigint) => {
        if (!spenderAddress) {
            console.error('❌ No spender address provided!');
            return;
        }
        writeContract({
            address: tokenAddress,
            abi: ERC20_ABI,
            functionName: 'approve',
            args: [spenderAddress, amount],
        });
    };

    // Mint function (for testing - mints to connected wallet)
    const mint = (amount: string) => {
        console.log('=== MINT FUNCTION CALLED ===');
        console.log('Amount:', amount);
        console.log('Connected address:', address);
        console.log('Token address:', tokenAddress);

        if (!address) {
            console.error('❌ No address connected!');
            return;
        }

        console.log('✅ Calling writeContract...');
        try {
            writeContract({
                address: tokenAddress,
                abi: ERC20_ABI,
                functionName: 'mint',
                args: [address, parseEther(amount)],
            });
            console.log('✅ writeContract called successfully');
        } catch (err) {
            console.error('❌ Error calling writeContract:', err);
        }
    };

    return {
        balance: balanceResult.data ? formatEther(balanceResult.data as bigint) : '0',
        allowance: allowanceResult.data ? formatEther(allowanceResult.data as bigint) : '0',
        refetchBalance: balanceResult.refetch,
        refetchAllowance: allowanceResult.refetch,
        approve,
        mint,
        isPending,
        isConfirming,
        isConfirmed,
        isSuccess,
        error,
        hash,
    };
}
