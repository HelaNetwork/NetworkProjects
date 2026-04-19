import type {
  ActivityItem,
  Investment,
  Listing,
  Property,
  UserProfile,
} from "@/types";

export const MOCK_PROPERTIES: Property[] = [
  {
    id: "prop_001",
    name: "Azure Skyline Residences",
    location: "Downtown Dubai, UAE",
    country: "UAE",
    city: "Dubai",
    type: "Residential",
    image:
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
    ],
    description:
      "A landmark 42-floor residential tower in the heart of Downtown Dubai featuring luxury apartments with panoramic views of Burj Khalifa and The Dubai Fountain. Premium amenities include infinity pool, concierge, and private cinema.",
    totalValuation: 45000000,
    tokenizedAmount: 18000000,
    pricePerShare: 100,
    totalShares: 180000,
    availableShares: 47200,
    yieldPercent: 9.2,
    monthlyRental: 138000,
    operatingCosts: 22000,
    managementFeePercent: 8,
    insuranceCost: 4500,
    capRate: 8.7,
    occupancy: 96,
    totalInvestors: 1247,
    status: "active",
    yearBuilt: 2021,
    areaSize: 68000,
    isFeatured: true,
  },
  {
    id: "prop_002",
    name: "Pacific Heights Mansion",
    location: "San Francisco, California",
    country: "USA",
    city: "San Francisco",
    type: "Residential",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
      "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80",
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&q=80",
    ],
    description:
      "Historic Victorian mansion fully restored with modern interiors in San Francisco's most prestigious neighborhood. Features 8 bedrooms, formal gardens, wine cellar, and stunning bay views.",
    totalValuation: 12500000,
    tokenizedAmount: 7500000,
    pricePerShare: 50,
    totalShares: 150000,
    availableShares: 89000,
    yieldPercent: 7.4,
    monthlyRental: 46250,
    operatingCosts: 8200,
    managementFeePercent: 6,
    insuranceCost: 2100,
    capRate: 7.1,
    occupancy: 94,
    totalInvestors: 823,
    status: "active",
    yearBuilt: 1908,
    areaSize: 12400,
    isFeatured: true,
  },
  {
    id: "prop_003",
    name: "Nexus Commerce Tower",
    location: "Canary Wharf, London",
    country: "UK",
    city: "London",
    type: "Commercial",
    image:
      "https://images.unsplash.com/photo-1575517111478-7f6afd0973db?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1575517111478-7f6afd0973db?w=800&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
      "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80",
    ],
    description:
      "Grade-A office building in the prestigious Canary Wharf financial district. Fully leased to Fortune 500 tenants with 15-year agreements. LEED Gold certified sustainable building.",
    totalValuation: 85000000,
    tokenizedAmount: 42500000,
    pricePerShare: 250,
    totalShares: 170000,
    availableShares: 31500,
    yieldPercent: 11.3,
    monthlyRental: 399750,
    operatingCosts: 65000,
    managementFeePercent: 7,
    insuranceCost: 12000,
    capRate: 10.8,
    occupancy: 99,
    totalInvestors: 2891,
    status: "active",
    yearBuilt: 2019,
    areaSize: 145000,
    isFeatured: true,
  },
  {
    id: "prop_004",
    name: "Marina Bay Suites",
    location: "Marina Bay, Singapore",
    country: "Singapore",
    city: "Singapore",
    type: "Residential",
    image:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80",
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&q=80",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
    ],
    description:
      "Ultra-luxury waterfront suites with direct marina access. Each unit features floor-to-ceiling glass, smart home automation, and a private yacht berth. Managed by Six Senses Hotels.",
    totalValuation: 32000000,
    tokenizedAmount: 16000000,
    pricePerShare: 80,
    totalShares: 200000,
    availableShares: 112000,
    yieldPercent: 8.8,
    monthlyRental: 117333,
    operatingCosts: 18500,
    managementFeePercent: 9,
    insuranceCost: 3800,
    capRate: 8.3,
    occupancy: 91,
    totalInvestors: 1056,
    status: "active",
    yearBuilt: 2022,
    areaSize: 42000,
  },
  {
    id: "prop_005",
    name: "Riviera Logistics Park",
    location: "Nice, France",
    country: "France",
    city: "Nice",
    type: "Industrial",
    image:
      "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
      "https://images.unsplash.com/photo-1575517111478-7f6afd0973db?w=800&q=80",
    ],
    description:
      "Modern last-mile logistics facility strategically located near Côte d'Azur International Airport. 100% leased to Amazon Logistics with 10-year triple net lease.",
    totalValuation: 28000000,
    tokenizedAmount: 14000000,
    pricePerShare: 40,
    totalShares: 350000,
    availableShares: 78000,
    yieldPercent: 12.1,
    monthlyRental: 141666,
    operatingCosts: 9000,
    managementFeePercent: 5,
    insuranceCost: 5200,
    capRate: 11.6,
    occupancy: 100,
    totalInvestors: 1678,
    status: "active",
    yearBuilt: 2020,
    areaSize: 85000,
  },
  {
    id: "prop_006",
    name: "Harbour View Mixed Complex",
    location: "Darling Harbour, Sydney",
    country: "Australia",
    city: "Sydney",
    type: "Mixed-Use",
    image:
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80",
    ],
    description:
      "Premium mixed-use development combining luxury residences, boutique retail, and co-working spaces in Sydney's iconic waterfront precinct. Award-winning sustainable architecture.",
    totalValuation: 58000000,
    tokenizedAmount: 29000000,
    pricePerShare: 150,
    totalShares: 193333,
    availableShares: 42000,
    yieldPercent: 10.5,
    monthlyRental: 254166,
    operatingCosts: 38000,
    managementFeePercent: 7.5,
    insuranceCost: 8500,
    capRate: 9.9,
    occupancy: 97,
    totalInvestors: 2134,
    status: "active",
    yearBuilt: 2023,
    areaSize: 92000,
  },
];

export const MOCK_INVESTMENTS: Investment[] = [
  {
    id: "inv_001",
    propertyId: "prop_001",
    propertyName: "Azure Skyline Residences",
    propertyLocation: "Downtown Dubai, UAE",
    propertyImage:
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&q=80",
    sharesOwned: 500,
    pricePerShare: 100,
    purchasePrice: 50000,
    currentValue: 53450,
    yieldEarned: 1840,
    claimableYield: 383,
    roi: 10.58,
    investedAt: "2024-03-15",
  },
  {
    id: "inv_002",
    propertyId: "prop_003",
    propertyName: "Nexus Commerce Tower",
    propertyLocation: "Canary Wharf, London",
    propertyImage:
      "https://images.unsplash.com/photo-1575517111478-7f6afd0973db?w=800&q=80",
    sharesOwned: 200,
    pricePerShare: 250,
    purchasePrice: 50000,
    currentValue: 54750,
    yieldEarned: 2825,
    claimableYield: 471,
    roi: 15.15,
    investedAt: "2024-01-22",
  },
  {
    id: "inv_003",
    propertyId: "prop_005",
    propertyName: "Riviera Logistics Park",
    propertyLocation: "Nice, France",
    propertyImage:
      "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80",
    sharesOwned: 1250,
    pricePerShare: 40,
    purchasePrice: 50000,
    currentValue: 51800,
    yieldEarned: 3025,
    claimableYield: 504,
    roi: 9.66,
    investedAt: "2024-02-08",
  },
];

export const MOCK_LISTINGS: Listing[] = [
  {
    id: "list_001",
    propertyName: "Emerald Coast Villa",
    status: "live",
    investors: 342,
    amountRaised: 1710000,
    totalTarget: 5000000,
    image:
      "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80",
    createdAt: "2024-06-01",
    city: "Marbella",
    country: "Spain",
    yieldPercent: 8.4,
  },
  {
    id: "list_002",
    propertyName: "Metro Plaza Office",
    status: "pending",
    investors: 0,
    amountRaised: 0,
    totalTarget: 12000000,
    image:
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
    createdAt: "2024-07-14",
    city: "Toronto",
    country: "Canada",
    yieldPercent: 9.8,
  },
  {
    id: "list_003",
    propertyName: "Lakeside Residences",
    status: "draft",
    investors: 0,
    amountRaised: 0,
    totalTarget: 8500000,
    createdAt: "2024-07-20",
    city: "Zurich",
    country: "Switzerland",
    yieldPercent: 7.2,
  },
];

export const MOCK_USER: UserProfile = {
  walletAddress: "7xKp...mN3q",
  username: "cryptobuilder",
  avatar:
    "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=200&q=80",
  country: "Singapore",
  joinDate: "2024-01-15",
  totalInvested: 150000,
  totalYield: 7690,
  claimableYield: 1358,
  listedProperties: 3,
  badges: [
    { id: "b1", label: "Early Adopter", icon: "⚡", color: "#D4AF37" },
    { id: "b2", label: "Diamond Holder", icon: "💎", color: "#00C8FF" },
    { id: "b3", label: "Property Lister", icon: "🏛️", color: "#00D68F" },
  ],
  referralCode: "AETR-7XKP",
  portfolioHistory: [
    { date: "Jan", value: 50000 },
    { date: "Feb", value: 100000 },
    { date: "Mar", value: 98000 },
    { date: "Apr", value: 115000 },
    { date: "May", value: 130000 },
    { date: "Jun", value: 142000 },
    { date: "Jul", value: 159200 },
  ],
  yieldHistory: [
    { month: "Jan", value: 380 },
    { month: "Feb", value: 820 },
    { month: "Mar", value: 1150 },
    { month: "Apr", value: 1640 },
    { month: "May", value: 2310 },
    { month: "Jun", value: 3180 },
    { month: "Jul", value: 3850 },
  ],
};

export const MOCK_ACTIVITY: ActivityItem[] = [
  {
    id: "act_001",
    type: "investment",
    user: "3xMp...k9Wz",
    amount: 12500,
    shares: 125,
    date: "2h ago",
  },
  {
    id: "act_002",
    type: "yield",
    user: "8qLr...fV2n",
    amount: 840,
    date: "5h ago",
  },
  {
    id: "act_003",
    type: "investment",
    user: "Kp7Y...nQ4s",
    amount: 25000,
    shares: 100,
    date: "8h ago",
  },
  {
    id: "act_004",
    type: "transfer",
    user: "wN9T...hX1m",
    amount: 5000,
    shares: 50,
    date: "1d ago",
  },
  {
    id: "act_005",
    type: "investment",
    user: "zR2B...jL6p",
    amount: 8000,
    shares: 80,
    date: "1d ago",
  },
];

export const WALLET_OPTIONS = [
  {
    id: "phantom",
    name: "Phantom",
    icon: "👻",
    description: "Most popular Solana wallet",
    deepLink: "phantom://",
    storeUrl: {
      android: "https://play.google.com/store/apps/details?id=app.phantom",
      ios: "https://apps.apple.com/app/phantom-solana-wallet/id1598432977",
    },
  },
  {
    id: "solflare",
    name: "Solflare",
    icon: "🔆",
    description: "Native Solana wallet",
    deepLink: "solflare://",
    storeUrl: {
      android:
        "https://play.google.com/store/apps/details?id=com.solflare.mobile",
      ios: "https://apps.apple.com/app/solflare-solana-wallet/id1580902717",
    },
  },
];

export const COUNTRIES = [
  "Afghanistan",
  "Australia",
  "Bahrain",
  "Brazil",
  "Canada",
  "China",
  "Egypt",
  "France",
  "Germany",
  "India",
  "Indonesia",
  "Japan",
  "Kuwait",
  "Malaysia",
  "Netherlands",
  "New Zealand",
  "Nigeria",
  "Norway",
  "Oman",
  "Pakistan",
  "Qatar",
  "Saudi Arabia",
  "Singapore",
  "South Korea",
  "Spain",
  "Sweden",
  "Switzerland",
  "Thailand",
  "UAE",
  "UK",
  "USA",
];

export const PROPERTY_TYPES = [
  "Residential",
  "Commercial",
  "Industrial",
  "Mixed-Use",
];

export function formatCurrency(value: number, compact = false): string {
  if (compact) {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatAddress(address: string): string {
  if (address.length <= 10) return address;
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

export function generateWalletAddress(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz123456789";
  let result = "";
  for (let i = 0; i < 44; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
