import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultWallets, RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';
import { helaTestnet } from './chains';

const { chains, publicClient } = configureChains(
    [helaTestnet],
    [
        jsonRpcProvider({
            rpc: (chain) => ({
                http: chain.rpcUrls.default.http[0],
            }),
        }),
    ],
);

const { connectors } = getDefaultWallets({
    appName: 'PayStream',
    projectId: 'paystream-dev', // Replace with WalletConnect project ID for prod
    chains,
});

const wagmiConfig = createConfig({
    autoConnect: true,
    connectors,
    publicClient,
});

export { wagmiConfig, chains, RainbowKitProvider, WagmiConfig, darkTheme };
