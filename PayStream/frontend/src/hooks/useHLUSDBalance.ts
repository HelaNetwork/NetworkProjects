import { useContractRead, useAccount } from 'wagmi';
import { erc20ABI } from '../abi/erc20';

const HLUSD_ADDRESS = import.meta.env.VITE_HLUSD_ADDRESS as `0x${string}` | undefined;

/**
 * Hook to read the connected wallet's HLUSD balance.
 */
export function useHLUSDBalance() {
    const { address, isConnected } = useAccount();

    const { data: balance, isLoading, isError } = useContractRead({
        address: HLUSD_ADDRESS,
        abi: erc20ABI,
        functionName: 'balanceOf',
        args: address ? [address] : undefined,
        enabled: isConnected && !!HLUSD_ADDRESS && !!address,
        watch: true,
    });

    return {
        balance: balance as bigint | undefined,
        isLoading,
        isError,
        isConfigured: !!HLUSD_ADDRESS,
    };
}
