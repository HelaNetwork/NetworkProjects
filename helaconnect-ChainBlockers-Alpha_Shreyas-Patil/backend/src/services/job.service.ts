import Job, { IJob } from '../models/job.model';

const MOCK_JOBS = [
  { title: 'Senior Solidity Developer', company: 'HelaLabs', description: 'Build and audit smart contracts for the Hela DeFi ecosystem. Work with cross-chain bridges, staking protocols, and AMMs.', location: 'Remote', type: 'full-time', role: 'Engineering', skills: ['Solidity', 'Hardhat', 'Ethers.js', 'DeFi', 'Smart Contracts'], salaryRange: '$120k – $180k', sourceUrl: 'https://helaconntect.com/careers', source: 'helaconntect', postedAt: '2 days ago', isActive: true },
  { title: 'Frontend Web3 Engineer', company: 'ChainFolio Inc.', description: 'Develop user-facing dApps using React, Wagmi and Ethers.js. Collaborate with design and smart contract teams to ship fast.', location: 'San Francisco, CA', type: 'full-time', role: 'Engineering', skills: ['React', 'TypeScript', 'Ethers.js', 'Web3.js', 'TailwindCSS'], salaryRange: '$110k – $160k', sourceUrl: 'https://chainfolio.io/jobs', source: 'ChainFolio', postedAt: '1 day ago', isActive: true },
  { title: 'Blockchain Security Auditor', company: 'Quantstamp', description: 'Audit smart contracts for vulnerabilities including reentrancy, flash loan attacks, and access control issues. Write detailed security reports.', location: 'Remote', type: 'full-time', role: 'Security', skills: ['Solidity', 'Security Auditing', 'DeFi', 'Cryptography', 'Smart Contracts'], salaryRange: '$140k – $200k', sourceUrl: 'https://quantstamp.com/jobs', source: 'Quantstamp', postedAt: '3 days ago', isActive: true },
  { title: 'DeFi Protocol Developer', company: 'Aave', description: 'Contribute to one of the largest DeFi lending protocols. Work on interest rate models, liquidation logic, and governance systems.', location: 'Remote', type: 'full-time', role: 'Engineering', skills: ['Solidity', 'DeFi', 'Python', 'Web3.js', 'GraphQL'], salaryRange: '$130k – $190k', sourceUrl: 'https://aave.com/careers', source: 'Aave', postedAt: '5 days ago', isActive: true },
  { title: 'NFT Platform Designer', company: 'OpenSea', description: 'Design beautiful, user-friendly interfaces for the worlds largest NFT marketplace. Create design systems and collaborate with engineering.', location: 'New York, NY', type: 'full-time', role: 'Design', skills: ['Figma', 'UI/UX Design', 'Web3', 'NFT', 'Prototyping'], salaryRange: '$90k – $140k', sourceUrl: 'https://opensea.io/jobs', source: 'OpenSea', postedAt: '1 week ago', isActive: true },
  { title: 'Rust Developer – Layer 2', company: 'StarkWare', description: 'Build high-performance ZK-rollup infrastructure in Rust. Work on proof generation systems and on-chain verifiers.', location: 'Remote', type: 'full-time', role: 'Engineering', skills: ['Rust', 'Zero Knowledge', 'Layer 2', 'Cryptography', 'C++'], salaryRange: '$150k – $220k', sourceUrl: 'https://starkware.co/careers', source: 'StarkWare', postedAt: '4 days ago', isActive: true },
  { title: 'Web3 Product Manager', company: 'Polygon', description: 'Drive product strategy for scaling solutions. Work cross-functionally with engineers, designers, and the community to ship impactful features.', location: 'Remote', type: 'full-time', role: 'Product Management', skills: ['Product Management', 'Blockchain', 'DeFi', 'Agile', 'Web3'], salaryRange: '$100k – $160k', sourceUrl: 'https://polygon.technology/careers', source: 'Polygon', postedAt: '6 days ago', isActive: true },
  { title: 'DevOps Engineer – Blockchain', company: 'Chainlink Labs', description: 'Manage blockchain node infrastructure, CI/CD pipelines, and monitoring for Chainlink oracle networks across multiple chains.', location: 'Remote', type: 'remote', role: 'DevOps', skills: ['Docker', 'Kubernetes', 'AWS', 'Blockchain', 'Go'], salaryRange: '$115k – $170k', sourceUrl: 'https://chain.link/careers', source: 'Chainlink', postedAt: '2 weeks ago', isActive: true },
  { title: 'Smart Contract Internship', company: 'Uniswap Labs', description: 'Paid internship working on DeFi smart contracts. Great opportunity to learn from top engineers in the Web3 space.', location: 'New York, NY', type: 'internship', role: 'Engineering', skills: ['Solidity', 'JavaScript', 'DeFi', 'Hardhat'], salaryRange: '$40/hr', sourceUrl: 'https://uniswap.org/careers', source: 'Uniswap', postedAt: '3 days ago', isActive: true },
  { title: 'Blockchain Marketing Lead', company: 'Binance', description: 'Lead marketing campaigns for Binance Smart Chain ecosystem projects. Manage social media, community, and partnerships.', location: 'Singapore', type: 'full-time', role: 'Marketing', skills: ['Marketing', 'Blockchain', 'Community Management', 'SEO', 'Web3'], salaryRange: '$80k – $120k', sourceUrl: 'https://binance.com/careers', source: 'Binance', postedAt: '1 week ago', isActive: true },
];

export const seedJobs = async (): Promise<void> => {
  const count = await Job.countDocuments();
  if (count === 0) {
    await Job.insertMany(MOCK_JOBS);
    console.log('✅ Jobs seeded');
  }
};

export const getJobs = async (params: {
  search?: string;
  role?: string;
  location?: string;
  type?: string;
  page?: number;
  limit?: number;
}): Promise<{ jobs: IJob[]; total: number; page: number; pages: number }> => {
  const { search, role, location, type, page = 1, limit = 6 } = params;

  const filter: Record<string, unknown> = { isActive: true };
  if (search) filter.$text = { $search: search };
  if (type && type !== 'all') filter.type = type;
  if (location) filter.location = { $regex: location, $options: 'i' };
  if (role && role !== 'All Roles') filter.role = { $regex: role, $options: 'i' };

  const total = await Job.countDocuments(filter);
  const jobs = await Job.find(filter)
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ createdAt: -1 });

  return { jobs, total, page, pages: Math.ceil(total / limit) };
};

export const getJobById = async (id: string): Promise<IJob | null> => {
  return Job.findById(id);
};