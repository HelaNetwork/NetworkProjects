export interface Property {
  id: string;
  name: string;
  location: string;
  country: string;
  city: string;
  type: 'Residential' | 'Commercial' | 'Industrial' | 'Mixed-Use';
  image: string;
  images: string[];
  description: string;
  totalValuation: number;
  tokenizedAmount: number;
  pricePerShare: number;
  totalShares: number;
  availableShares: number;
  yieldPercent: number;
  monthlyRental: number;
  operatingCosts: number;
  managementFeePercent: number;
  insuranceCost: number;
  capRate: number;
  occupancy: number;
  totalInvestors: number;
  status: 'active' | 'pending' | 'sold_out';
  yearBuilt?: number;
  areaSize?: number;
  isFeatured?: boolean;
}

export interface Investment {
  id: string;
  propertyId: string;
  propertyName: string;
  propertyLocation: string;
  propertyImage: string;
  sharesOwned: number;
  pricePerShare: number;
  purchasePrice: number;
  currentValue: number;
  yieldEarned: number;
  claimableYield: number;
  roi: number;
  investedAt: string;
}

export interface Listing {
  id: string;
  propertyName: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'live';
  investors: number;
  amountRaised: number;
  totalTarget: number;
  image?: string;
  createdAt: string;
  city?: string;
  country?: string;
  yieldPercent?: number;
}

export interface UserProfile {
  walletAddress: string;
  username: string;
  avatar?: string;
  country?: string;
  joinDate: string;
  totalInvested: number;
  totalYield: number;
  claimableYield: number;
  listedProperties: number;
  badges: Badge[];
  referralCode: string;
  portfolioHistory: PortfolioPoint[];
  yieldHistory: YieldPoint[];
}

export interface Badge {
  id: string;
  label: string;
  icon: string;
  color: string;
}

export interface PortfolioPoint {
  date: string;
  value: number;
}

export interface YieldPoint {
  month: string;
  value: number;
}

export interface Document {
  id: string;
  name: string;
  type: 'pdf' | 'image';
  url: string;
}

export interface ActivityItem {
  id: string;
  type: 'investment' | 'yield' | 'transfer';
  user: string;
  amount: number;
  shares?: number;
  date: string;
}

export type PropertyFilter = {
  country: string | null;
  type: string | null;
  minYield: number | null;
  maxYield: number | null;
  sortBy: 'yield' | 'newest' | 'price_asc' | 'price_desc';
};
