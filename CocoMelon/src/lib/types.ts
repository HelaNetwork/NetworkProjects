export interface UserProfile {
  address: string;
  identityHash: string;
  name: string;
  age: number;
  bio: string;
  interests: string[];
  imageUrl: string;
  ipfsCid: string;
  createdAt: number;
}

export interface Match {
  id: string;
  matchIndex: number;
  user1Hash: string;
  user2Hash: string;
  timestamp: number;
  active: boolean;
  profile?: UserProfile;
}

export interface ChatMessage {
  id: string;
  matchId: string;
  senderHash: string;
  content: string;
  encrypted: boolean;
  timestamp: number;
  proofHash?: string;
  txHash?: string;
}

export interface OnChainEvent {
  type: "like" | "match" | "payment" | "message_proof";
  txHash: string;
  blockNumber: number;
  timestamp: number;
  data: Record<string, string>;
}

export interface Notification {
  id: string;
  type: "match" | "message" | "like" | "system";
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
}

export interface ContractState {
  likeFee: bigint;
  swipeFee: bigint;
  messageFee: bigint;
  premiumFee: bigint;
  isPremium: boolean;
  messageCredits: number;
  totalLikes: number;
  totalMatches: number;
}
