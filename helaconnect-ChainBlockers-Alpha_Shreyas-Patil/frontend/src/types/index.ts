// Shared TypeScript types across the app

export interface User {
  _id: string;
  walletAddress: string;
  fullName: string;
  dateOfBirth?: string;
  bio?: string;
  education?: Education;
  isWorking: boolean;
  work?: Work;
  skills: string[];
  following: string[];
  followers: string[];
  profileImage?: string;
  isOnboarded: boolean;
  createdAt: string;
  recentTx?: string;
  trxAgo?: string;
}

export interface Education {
  degree: string;
  institution: string;
  year: number;
  fieldOfStudy: string;
}

export interface Work {
  companyName: string;
  jobTitle: string;
  yearsOfExperience: number;
}

export interface Job {
  _id: string;
  title: string;
  company: string;
  description: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'remote' | 'internship';
  role: string;
  skills: string[];
  salaryRange?: string;
  sourceUrl: string;
  source: string;
  postedAt: string;
  isActive: boolean;
}

export interface Event {
  _id: string;
  title: string;
  description: string;
  location: string;
  address: string;
  date: string;
  time?: string;
  type: 'workshop' | 'conference' | 'meetup' | 'webinar' | 'hackathon' | 'other';
  tags: string[];
  organizer: string;
  sourceUrl: string;
  source: string;
  imageUrl?: string;
  isFree: boolean;
  price?: string;
  isActive: boolean;
}

export interface Airdrop {
  _id: string;
  title: string;
  description: string;
  reward: string;
  endDate: string;
  participationLink: string;
  isActive: boolean;
}

export interface OnboardingData {
  fullName: string;
  dateOfBirth: string;
  education: Education;
  isWorking: boolean;
  work?: Work;
  skills: string[];
}

export interface OnChainData {
  balance: string;
  totalTransactions: number;
  gasUsed: string;
  recentTransactions: Transaction[];
  nfts: NFT[];
  tokenHoldings: Token[];
  tokenTransfers: TokenTransfer[];
  contractsCreated: number;
}

export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: string;
  status: string;
}

export interface NFT {
  tokenId: string;
  contractAddress: string;
  name: string;
  imageUrl?: string;
}

export interface Token {
  symbol: string;
  name: string;
  balance: string;
  contractAddress: string;
}

export interface TokenTransfer {
  hash: string;
  from: string;
  to: string;
  value: string;
  token: string;
  timestamp: string;
}
