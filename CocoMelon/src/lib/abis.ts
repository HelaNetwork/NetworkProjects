export const LIKE_REGISTRY_ABI = [
  {
    type: "function",
    name: "submitLike",
    inputs: [
      { name: "fromHash", type: "bytes32" },
      { name: "toHash", type: "bytes32" },
      { name: "proofHash", type: "bytes32" },
    ],
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "hasLiked",
    inputs: [
      { name: "from", type: "bytes32" },
      { name: "to", type: "bytes32" },
    ],
    outputs: [{ type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "isMatch",
    inputs: [
      { name: "user1", type: "bytes32" },
      { name: "user2", type: "bytes32" },
    ],
    outputs: [{ type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getLikesCount",
    inputs: [],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getLike",
    inputs: [{ name: "index", type: "uint256" }],
    outputs: [
      {
        type: "tuple",
        components: [
          { name: "fromHash", type: "bytes32" },
          { name: "toHash", type: "bytes32" },
          { name: "proofHash", type: "bytes32" },
          { name: "timestamp", type: "uint256" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "likeFee",
    inputs: [],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "setLikeFee",
    inputs: [{ name: "_fee", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    name: "LikeSubmitted",
    inputs: [
      { name: "fromHash", type: "bytes32", indexed: true },
      { name: "toHash", type: "bytes32", indexed: true },
      { name: "proofHash", type: "bytes32", indexed: false },
      { name: "timestamp", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "MatchCreated",
    inputs: [
      { name: "user1", type: "bytes32", indexed: true },
      { name: "user2", type: "bytes32", indexed: true },
      { name: "timestamp", type: "uint256", indexed: false },
    ],
  },
] as const;

export const MATCH_REGISTRY_ABI = [
  {
    type: "function",
    name: "registerMatch",
    inputs: [
      { name: "user1", type: "bytes32" },
      { name: "user2", type: "bytes32" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getUserMatches",
    inputs: [{ name: "userHash", type: "bytes32" }],
    outputs: [{ type: "bytes32[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getMatchesCount",
    inputs: [],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getMatch",
    inputs: [{ name: "matchId", type: "uint256" }],
    outputs: [
      {
        type: "tuple",
        components: [
          { name: "user1", type: "bytes32" },
          { name: "user2", type: "bytes32" },
          { name: "timestamp", type: "uint256" },
          { name: "active", type: "bool" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "deactivateMatch",
    inputs: [{ name: "matchId", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    name: "MatchRegistered",
    inputs: [
      { name: "matchId", type: "uint256", indexed: true },
      { name: "user1", type: "bytes32", indexed: true },
      { name: "user2", type: "bytes32", indexed: true },
      { name: "timestamp", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "MatchDeactivated",
    inputs: [{ name: "matchId", type: "uint256", indexed: true }],
  },
] as const;

export const PAYMENT_MANAGER_ABI = [
  {
    type: "function",
    name: "payForSwipe",
    inputs: [],
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "payForMessages",
    inputs: [{ name: "count", type: "uint256" }],
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "unlockPremium",
    inputs: [],
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "storeMessageProof",
    inputs: [
      { name: "matchHash", type: "bytes32" },
      { name: "messageHash", type: "bytes32" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "isPremium",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getMessageCredits",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "swipeFee",
    inputs: [],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "messageFee",
    inputs: [],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "setFees",
    inputs: [
      { name: "_swipe", type: "uint256" },
      { name: "_message", type: "uint256" },
      { name: "_premium", type: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    name: "SwipePayment",
    inputs: [
      { name: "user", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
      { name: "timestamp", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "MessagePayment",
    inputs: [
      { name: "user", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
      { name: "credits", type: "uint256", indexed: false },
      { name: "timestamp", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "PremiumUnlocked",
    inputs: [
      { name: "user", type: "address", indexed: true },
      { name: "timestamp", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "MessageProofStored",
    inputs: [
      { name: "matchHash", type: "bytes32", indexed: true },
      { name: "messageHash", type: "bytes32", indexed: false },
      { name: "timestamp", type: "uint256", indexed: false },
    ],
  },
] as const;
