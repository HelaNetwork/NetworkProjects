import { cookieStorage, createConfig, createStorage, http } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { defineChain } from 'viem';

export const helaTestnet = defineChain({
    id: 666888,
    name: 'HeLa Testnet',
    nativeCurrency: {
        name: 'HELA',
        symbol: 'HELA',
        decimals: 18,
    },
    rpcUrls: {
        default: {
            http: ['https://testnet-rpc.helachain.com'],
        },
    },
    blockExplorers: {
        default: {
            name: 'HeLa Explorer',
            url: 'https://testnet-blockexplorer.helachain.com',
        },
    },
    testnet: true,
});

export function getConfig() {
    return createConfig({
        chains: [helaTestnet],
        connectors: [
            injected({ target: 'metaMask' }),
        ],
        storage: createStorage({
            storage: cookieStorage,
        }),
        ssr: true,
        transports: {
            [helaTestnet.id]: http(),
        },
    });
}

declare module 'wagmi' {
    interface Register {
        config: ReturnType<typeof getConfig>;
    }
}