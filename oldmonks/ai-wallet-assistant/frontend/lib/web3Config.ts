import { createAppKit } from '@reown/appkit';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { mainnet } from '@reown/appkit/networks';

// Replace with your actual Reown Project ID from https://cloud.reown.com
const PROJECT_ID = 'YOUR_PROJECT_ID';

if (!PROJECT_ID || PROJECT_ID === 'YOUR_PROJECT_ID') {
  console.warn('⚠️ PROJECT_ID not set. Add your Reown Project ID to lib/web3Config.ts');
}

// Create the WagmiAdapter
export const wagmiAdapter = new WagmiAdapter({
  networks: [mainnet],
  projectId: PROJECT_ID,
  ssr: true,
});

// Create the AppKit instance
export const appKit = createAppKit({
  adapters: [wagmiAdapter],
  networks: [mainnet],
  projectId: PROJECT_ID,
  features: {
    analytics: true,
  },
});

export default appKit;
