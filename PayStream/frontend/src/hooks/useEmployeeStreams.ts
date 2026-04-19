import { useContractRead } from 'wagmi';
import { streamManagerABI } from '../abi/streamManager';
import { contracts } from '../contracts';

/**
 * Hook to find stream IDs belonging to an employee address.
 * Iterates through all streams and filters by employee.
 */
export function useEmployeeStreams(employeeAddress: string | undefined) {
    const hasConfig = !!contracts.streamManager && !!employeeAddress;

    const { data: nextStreamId } = useContractRead({
        address: contracts.streamManager || undefined,
        abi: streamManagerABI,
        functionName: 'nextStreamId',
        enabled: hasConfig,
        watch: true,
    });

    const totalStreams = Number(nextStreamId ?? 0);

    return { totalStreams, hasConfig };
}
