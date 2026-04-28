export const INTENT_SWAP_ADDRESS = '0x28DaED322680592883F685716975D75DB1037724'

export const INTENT_SWAP_ABI = [
  {
    inputs: [
      { name: 'fromToken', type: 'string' },
      { name: 'toToken',   type: 'string' },
      { name: 'amount',    type: 'uint256' },
    ],
    name:            'executeSwap',
    outputs:         [],
    stateMutability: 'payable',
    type:            'function',
  },
  {
    inputs: [
      { name: 'fromToken', type: 'string' },
      { name: 'toToken',   type: 'string' },
      { name: 'amount',    type: 'uint256' },
    ],
    name:            'simulateSwap',
    outputs:         [],
    stateMutability: 'nonpayable',
    type:            'function',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true,  name: 'user',      type: 'address' },
      { indexed: false, name: 'fromToken', type: 'string'  },
      { indexed: false, name: 'toToken',   type: 'string'  },
      { indexed: false, name: 'amount',    type: 'uint256' },
      { indexed: false, name: 'timestamp', type: 'uint256' },
    ],
    name: 'SwapExecuted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true,  name: 'user',      type: 'address' },
      { indexed: false, name: 'fromToken', type: 'string'  },
      { indexed: false, name: 'toToken',   type: 'string'  },
      { indexed: false, name: 'amount',    type: 'uint256' },
      { indexed: false, name: 'timestamp', type: 'uint256' },
    ],
    name: 'SwapSimulated',
    type: 'event',
  },
]