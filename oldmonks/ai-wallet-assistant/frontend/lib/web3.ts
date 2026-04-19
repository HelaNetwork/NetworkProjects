import { createConfig, http } from 'wagmi';
import { mainnet } from 'wagmi/chains';

/**
 * Wagmi configuration with Ethereum mainnet
 * Uses public HTTP transport for wallet connections
 */
export const wagmiConfig = createConfig({
  chains: [mainnet],
  transports: {
    [mainnet.id]: http(),
  },
});
