
import { Chain } from 'wagmi/chains';

export const hela = {
    id: 666888,
    name: 'HeLa Testnet',

    nativeCurrency: {
        decimals: 18,
        name: 'HeLa USD',
        symbol: 'HLUSD',
    },
    rpcUrls: {
        public: { http: ['https://testnet-rpc.helachain.com'] },
        default: { http: ['https://testnet-rpc.helachain.com'] },
    },
    blockExplorers: {
        default: { name: 'HeLa Explorer', url: 'https://testnet-blockexplorer.helachain.com' },
    },
    testnet: true,
} as const satisfies Chain;
