import { mainnet, arbitrum } from '@reown/appkit/networks'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'

export const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID;

if (!projectId) {
  console.warn('Reown Project ID is missing from environment variables!')
}

export const networks: [any, ...any[]] = [mainnet, arbitrum];

export const wagmiAdapter = new WagmiAdapter({
  projectId: projectId || '',
  networks
})

export const config = wagmiAdapter.wagmiConfig;
