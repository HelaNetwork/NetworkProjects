import React from 'react';
import { Book, Cpu, Image as ImageIcon, Zap, Coins, Repeat, Sparkles } from 'lucide-react';

/**
 * Lessons refined for the "Learn → Do → Earn" model on Hela Chain.
 */
export const lessons = [
  {
    id: 'intro',
    title: 'Hela Basics',
    description: 'Enter the Hela ecosystem and setup your first secure wallet.',
    difficulty: 'Beginner',
    progress: 100,
    progressColor: 'bg-duo-green',
    icon: <Book className="text-white w-8 h-8" />,
    unit: 'Learn → Do → Earn',
    tasks: [
      { 
        id: 't1', 
        title: 'Learn: Hela Ecosystem', 
        description: 'Read about Hela\'s unique Layer 1 protocol features.', 
        type: 'info',
        learnContent: 'Hela is a Layer 1 blockchain aimed at mass adoption with a focus on stability and real-world utility.'
      },
      { 
        id: 't2', 
        title: 'Do: Network Proof', 
        description: 'Prepare for the chain. Send a small HLSC transaction to verify your wallet.', 
        type: 'interaction',
        actionLabel: 'Verify HLSC Transfer' 
      }
    ],
    earn: {
      xp: 100,
      badge: 'Hela Genesis',
      reward: 'Early Learner Tag'
    },
    quiz: [
      {
        question: "What is the native currency of Hela Chain?",
        options: ["ETH", "HLSC", "SOL", "MATIC"],
        answer: 1
      }
    ]
  },
  {
    id: 'defi',
    title: 'Hela DeFi',
    description: 'Interact with decentralized pools and swaps on Hela.',
    difficulty: 'Intermediate',
    progress: 45,
    progressColor: 'bg-duo-blue',
    icon: <Repeat className="text-white w-8 h-8" />,
    unit: 'Swap & Yield',
    tasks: [
      { 
        id: 't3', 
        title: 'Learn: AMM Basics', 
        description: 'Learn how Automated Market Makers work on Hela.', 
        type: 'info',
        learnContent: 'AMMs use liquidity pools to allow users to swap tokens without a traditional buyer-seller match.'
      },
      { 
        id: 't4', 
        title: 'Do: Token Swap', 
        description: 'Perform a swap of HLSC for HL-USD on the Hela Testnet.', 
        type: 'interaction',
        actionLabel: 'Verify Swap Hash'
      }
    ],
    earn: {
      xp: 250,
      badge: 'DeFi Navigator',
      reward: 'Yield Master Badge'
    },
    quiz: [
      {
        question: "What is the primary benefit of a Liquidity Pool?",
        options: ["Lower gas fees", "Centralized control", "Instant swapping", "Higher privacy"],
        answer: 2
      }
    ]
  },
  {
    id: 'nfts',
    title: 'NFT Explorer',
    description: 'Mint and manage digital identities on Hela.',
    difficulty: 'Advanced',
    progress: 0,
    progressColor: 'bg-duo-yellow',
    unit: 'Mint & Collect',
    icon: <ImageIcon className="text-white w-8 h-8" />,
    tasks: [
      { 
        id: 't5', 
        title: 'Learn: Digital Ownership', 
        description: 'Understand how NFTs represent proof of ownership.', 
        type: 'info',
        learnContent: 'NFTs on Hela use the ERC-721/1155 standards for unique digital items.'
      },
      { 
        id: 't6', 
        title: 'Do: Mint NFT', 
        description: 'Mint your "Hela Pioneer" NFT card on testnet.', 
        type: 'interaction',
        actionLabel: 'Verify Mint Hash'
      }
    ],
    earn: {
      xp: 500,
      badge: 'NFT Architect',
      reward: 'Exclusive Pioneer NFT'
    },
    quiz: [
      {
        question: "Which token standard is typically used for NFTs?",
        options: ["ERC-20", "ERC-721", "ERC-1155", "Both B and C"],
        answer: 3
      }
    ]
  }
];
