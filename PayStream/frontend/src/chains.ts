import { Chain } from 'wagmi';

export const helaTestnet: Chain = {
    id: 666888,
    name: 'HeLa Testnet',
    network: 'hela-testnet',
    nativeCurrency: {
        name: 'HELA',
        symbol: 'HELA',
        decimals: 18,
    },
    rpcUrls: {
        default: {
            http: [import.meta.env.VITE_HELA_RPC || 'https://testnet-rpc.helachain.com/'],
        },
        public: {
            http: [import.meta.env.VITE_HELA_RPC || 'https://testnet-rpc.helachain.com/'],
        },
    },
    blockExplorers: {
        default: {
            name: 'HeLa Explorer',
            url: 'https://testnet-blockexplorer.helachain.com',
        },
    },
    testnet: true,
};
