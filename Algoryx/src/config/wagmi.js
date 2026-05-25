import { createConfig, http } from 'wagmi'
import { mainnet } from 'wagmi/chains'
import { injected, metaMask } from 'wagmi/connectors'
import { defineChain } from 'viem'

// Define HeLa Testnet as a custom chain
export const helaTestnet = defineChain({
  id:   666888,
  name: 'HeLa Testnet',
  nativeCurrency: {
    name:     'HLUSD',
    symbol:   'HLUSD',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['https://testnet-rpc.helachain.com'] },
  },
  blockExplorers: {
    default: {
      name: 'HeLa Explorer',
      url:  'https://testnet-blockexplorer.helachain.com',
    },
  },
  testnet: true,
})

// Define HeLa Mainnet (optional, for later)
export const helaMainnet = defineChain({
  id:   8668,
  name: 'HeLa',
  nativeCurrency: {
    name:     'HLUSD',
    symbol:   'HLUSD',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['https://mainnet-rpc.helachain.com'] },
  },
  blockExplorers: {
    default: {
      name: 'HeLa Explorer',
      url:  'https://blockexplorer.helachain.com',
    },
  },
})

export const config = createConfig({
  chains: [helaTestnet, mainnet],       // HeLa first = default chain
  connectors: [injected(), metaMask()],
  transports: {
    [helaTestnet.id]: http('https://testnet-rpc.helachain.com'),
    [mainnet.id]:     http(),
  },
})