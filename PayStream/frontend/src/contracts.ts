/**
 * Contract addresses loaded from environment variables.
 */
export const contracts = {
    hlusd: (import.meta.env.VITE_HLUSD_ADDRESS || '') as `0x${string}`,
    streamManager: (import.meta.env.VITE_STREAMMANAGER_ADDRESS || '') as `0x${string}`,
    yieldVault: (import.meta.env.VITE_YIELDVAULT_ADDRESS || '') as `0x${string}`,
};
