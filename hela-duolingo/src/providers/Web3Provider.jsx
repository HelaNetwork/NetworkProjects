import React from 'react';
import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultConfig,
  RainbowKitProvider,
  darkTheme,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider, http } from 'wagmi';
import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";

// Define Hela Testnet Custom Chain
const helaTestnet = {
  id: 666888,
  name: 'Hela Testnet',
  nativeCurrency: { name: 'Hela', symbol: 'HLSC', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://testnet-rpc.helachain.com'] },
  },
  blockExplorers: {
    default: { name: 'HelaScan', url: 'https://testnet-blockexplorer.helachain.com' },
  },
  testnet: true,
};

const config = getDefaultConfig({
  appName: 'CryptoDuo',
  projectId: 'YOUR_PROJECT_ID',
  chains: [helaTestnet],
  transports: {
    [helaTestnet.id]: http(),
  },
});

const queryClient = new QueryClient();

export const Web3Provider = ({ children }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme({
          accentColor: '#58CC02',
          accentColorForeground: 'white',
          borderRadius: 'large',
        })}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
