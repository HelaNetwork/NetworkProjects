import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultConfig,
  RainbowKitProvider,
  lightTheme,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import {
  sepolia,
  polygonMumbai,
} from 'wagmi/chains';
import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";

export const config = getDefaultConfig({
  appName: 'Web3Quest',
  projectId: 'YOUR_PROJECT_ID', // User should ideally provide this, but we can't block. 
  // In a real app, users would set up WalletConnect Cloud.
  chains: [sepolia, polygonMumbai],
  ssr: true, 
});

export const queryClient = new QueryClient();

export { RainbowKitProvider, WagmiProvider, lightTheme };
