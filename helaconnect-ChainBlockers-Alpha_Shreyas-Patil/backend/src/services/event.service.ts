import Event, { IEvent } from '../models/event.model';

const MOCK_EVENTS = [
  { 
    title: 'Web3 Builders Summit 2024', 
    description: 'Annual gathering of blockchain developers, founders, and investors. Keynotes, workshops, and networking sessions.', 
    location: 'San Francisco, CA', 
    address: 'Moscone Center, 747 Howard St', 
    date: '2024-08-15', 
    time: '9:00 AM', 
    type: 'conference', 
    tags: ['Web3', 'Blockchain', 'DeFi', 'NFT'], 
    organizer: 'Web3 Foundation', 
    sourceUrl: 'https://eventbrite.com/web3-summit', 
    source: 'Eventbrite', 
    isFree: false, 
    price: '$299' 
  },
  { 
    title: 'Ethereum Smart Contract Workshop', 
    description: 'Hands-on workshop for writing, testing, and deploying Ethereum smart contracts. Beginner to intermediate level.', 
    location: 'Remote', 
    address: 'Online via Zoom', 
    date: '2024-07-20', 
    time: '2:00 PM', 
    type: 'workshop', 
    tags: ['Ethereum', 'Solidity', 'Smart Contracts'], 
    organizer: 'ETH Global', 
    sourceUrl: 'https://ethglobal.com/workshops', 
    source: 'ETHGlobal', 
    isFree: true 
  },
  { 
    title: 'DeFi Hackathon – helaconntect Edition', 
    description: 'Build DeFi applications on the Hela blockchain. $50,000 in prizes. Solo or team participation.', 
    location: 'Singapore', 
    address: 'Marina Bay Sands Convention Centre', 
    date: '2024-09-01', 
    time: '10:00 AM', 
    type: 'hackathon', 
    tags: ['Hackathon', 'DeFi', 'helaconntect', 'Prize'], 
    organizer: 'HelaLabs', 
    sourceUrl: 'https://helaconntect.com/hackathon', 
    source: 'helaconntect', 
    isFree: true 
  },
  { 
    title: 'NFT & Digital Art Meetup', 
    description: 'Network with NFT artists, collectors, and marketplace builders. Demos, live minting, and gallery viewing.', 
    location: 'New York, NY', 
    address: '111 West 57th Street, Manhattan', 
    date: '2024-07-28', 
    time: '6:00 PM', 
    type: 'meetup', 
    tags: ['NFT', 'Digital Art', 'Community'], 
    organizer: 'NYC NFT Collective', 
    sourceUrl: 'https://meetup.com/nyc-nft', 
    source: 'Meetup.com', 
    isFree: false, 
    price: '$25' 
  },
  { 
    title: 'Blockchain Security Webinar', 
    description: 'Learn about common smart contract vulnerabilities, reentrancy attacks, and security best practices.', 
    location: 'Remote', 
    address: 'Online', 
    date: '2024-07-25', 
    time: '4:00 PM', 
    type: 'webinar', 
    tags: ['Security', 'Smart Contracts', 'Auditing'], 
    organizer: 'ChainSec Academy', 
    sourceUrl: 'https://chainsec.io/webinar', 
    source: 'ChainSec', 
    isFree: true 
  },
  { 
    title: 'Web3 Career Fair', 
    description: 'Connect with top Web3 companies hiring now. Bring your resume and portfolio. Open to all skill levels.', 
    location: 'Austin, TX', 
    address: '600 Congress Ave, Austin', 
    date: '2024-08-05', 
    time: '11:00 AM', 
    type: 'other', 
    tags: ['Careers', 'Web3', 'Networking', 'Jobs'], 
    organizer: 'CryptoJobs', 
    sourceUrl: 'https://cryptojobs.com/fair', 
    source: 'CryptoJobs', 
    isFree: true 
  },
  { 
    title: 'Zero Knowledge Proofs Workshop', 
    description: 'Deep dive into ZK proofs, zkSNARKs, and their applications in blockchain privacy and scalability.', 
    location: 'Remote', 
    address: 'Online via Discord', 
    date: '2024-08-10', 
    time: '3:00 PM', 
    type: 'workshop', 
    tags: ['ZK Proofs', 'Privacy', 'Cryptography'], 
    organizer: 'ZK Research Collective', 
    sourceUrl: 'https://zkresearch.org/workshop', 
    source: 'ZKResearch', 
    isFree: true 
  },
  { 
    title: 'Layer 2 Solutions Conference', 
    description: 'Explore the latest Layer 2 scaling solutions including Optimism, Arbitrum, and zkSync. Expert panels.', 
    location: 'London, UK', 
    address: 'ExCeL London Exhibition Centre', 
    date: '2024-09-15', 
    time: '9:00 AM', 
    type: 'conference', 
    tags: ['Layer 2', 'Scaling', 'Ethereum', 'ZK'], 
    organizer: 'L2 Summit', 
    sourceUrl: 'https://l2summit.io', 
    source: 'L2Summit', 
    isFree: false, 
    price: '$199' 
  },
  { 
    title: 'Pune Web3 Meetup #1: Powered by Hive', 
    description: 'A deep dive into the Hive ecosystem. Features live onboarding, dApp showcases, and rewards demos for builders and creators.', 
    location: 'Pune, India', 
    address: 'Office 1012, T9, Bramhacorp Business Park, Wadgaon Sheri, Pune 411014', 
    date: '2026-04-18', 
    time: '3:00 PM', 
    type: 'meetup', 
    tags: ['Hive', 'Blockchain', 'Web3', 'Community'], 
    organizer: 'Pune Hive.io Meetup Group', 
    sourceUrl: 'https://www.meetup.com/pune-hive-io-meetup-group/events/314273834/', 
    source: 'Meetup.com', 
    isFree: true 
  }
];

export const seedEvents = async (): Promise<void> => {
  const count = await Event.countDocuments();
  if (count === 0) {
    await Event.insertMany(MOCK_EVENTS);
    console.log('✅ Events seeded');
  }
};

export const getEvents = async (params: {
  search?: string;
  type?: string;
  location?: string;
  tag?: string;
  page?: number;
  limit?: number;
}): Promise<{ events: IEvent[]; total: number; page: number; pages: number }> => {
  const { search, type, location, tag, page = 1, limit = 6 } = params;

  const filter: Record<string, unknown> = { isActive: true };
  if (search) filter.$text = { $search: search };
  if (type) filter.type = type;
  if (location) filter.location = { $regex: location, $options: 'i' };
  if (tag) filter.tags = { $in: [tag] };

  const total = await Event.countDocuments(filter);
  const events = await Event.find(filter)
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ date: 1 });

  return { events, total, page, pages: Math.ceil(total / limit) };
};
