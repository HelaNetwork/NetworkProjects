export const INTERNAL_CONTENT = {
  'edu-web3': {
    title: 'THE WEB3 REVOLUTION',
    subtitle: 'The Next Generation of the Internet',
    category: 'Education',
    sections: [
      {
        heading: 'What is Web3?',
        text: 'Web3 is the third generation of the World Wide Web, currently being built on top of blockchain technology. Unlike Web2, which is dominated by centralized platforms like Google and Meta, Web3 focuses on decentralization, user ownership, and privacy.',
        bullets: [
          'Ownership: You own your data and digital assets.',
          'Decentralization: Data is distributed across a network, not a single server.',
          'Trustless: You don\'t need to trust a middleman to interact with others.',
          'Permissionless: Anyone can use Web3 regardless of who they are or where they live.'
        ]
      },
      {
        heading: 'Why it matters',
        text: 'In the current web, users are often the product. Companies collect and sell your data. In Web3, you are the owner. You control your identity through your wallet and carry your data across different applications.'
      }
    ]
  },
  'edu-blockchain': {
    title: 'BLOCKCHAIN FUNDAMENTALS',
    subtitle: 'The Immutable Ledger',
    category: 'Education',
    sections: [
      {
        heading: 'Understanding Blockchain',
        text: 'A blockchain is a decentralized, distributed digital ledger that records transactions across many computers so that the record cannot be altered retroactively without the alteration of all subsequent blocks.',
        bullets: [
          'Blocks: Digital information stored in a "block".',
          'Chain: Blocks are linked together using cryptographic hashes.',
          'Consensus: The network must agree before a new block is added.',
          'Immutability: Once a transaction is recorded, it\'s permanent.'
        ]
      },
      {
        heading: 'How it Works',
        text: 'When a new transaction occurs, it is broadcast to a network of computers (nodes). These nodes verify the transaction using algorithms. Once verified, it is combined with other transactions to create a new block for the ledger.'
      }
    ]
  },
  'edu-wallet': {
    title: 'WALLET ESSENTIALS',
    subtitle: 'Your Gateway to Web3',
    category: 'Education',
    sections: [
      {
        heading: 'What is a Crypto Wallet?',
        text: 'A crypto wallet is a tool that allows you to interact with the blockchain. Contrary to popular belief, it doesn\'t "store" your crypto—your crypto lives on the blockchain. The wallet stores your "Private Keys" which give you the authority to move that crypto.',
        bullets: [
          'Private Keys: Like a digital signature or password that controls your funds.',
          'Public Address: Like an email address or bank account number you share with others.',
          'Seed Phrase: A 12-24 word phrase used to recover your wallet if you lose it.'
        ]
      },
      {
        heading: 'Security Tip',
        text: 'NEVER share your seed phrase or private keys with anyone. If someone has your seed phrase, they have full control over your money.'
      }
    ]
  },
  'edu-sc': {
    title: 'SMART CONTRACT HUB',
    subtitle: 'Programmable Trust',
    category: 'Education',
    sections: [
      {
        heading: 'Automatically Executing Agreements',
        text: 'Smart contracts are self-executing contracts with the terms of the agreement between buyer and seller being directly written into lines of code. The code and the agreements contained therein exist across a distributed, decentralized blockchain network.',
        bullets: [
          'Automation: Executes instantly when conditions are met.',
          'Accuracy: Removes the room for human error in manual processing.',
          'Trust: No need for a central authority or lawyer to verify.',
          'Cost: Reduces fees by removing intermediaries.'
        ]
      }
    ]
  },
  'edu-dapps': {
    title: 'DECENTRALIZED APPS (DAPPS)',
    subtitle: 'Building Without Borders',
    category: 'Education',
    sections: [
      {
        heading: 'What are dApps?',
        text: 'Decentralized applications (dApps) are digital applications or programs that exist and run on a blockchain or P2P network of computers instead of a single computer, and are outside the purview and control of a single authority.',
        bullets: [
          'Open Source: The backend code is usually public.',
          'Incentivized: Often use tokens to reward participants.',
          'Decentralized: No single point of failure.',
          'User Owned: Users often have a say in how the app is governed.'
        ]
      }
    ]
  },
  'sec-privacy': {
    title: 'PRIVACY PROTOCOL',
    subtitle: 'Protecting Your Digital Signature',
    category: 'Security',
    sections: [
      {
        heading: 'The Importance of Privacy',
        text: 'In the decentralized world, your transactions are public on the blockchain. While your identity is masked by an address, your behavior can still be tracked by data analytics firms.',
        bullets: [
          'VPN Usage: Masks your IP address and encrypts your connection.',
          'Tracker Blocking: Prevents websites from building a profile of you.',
          'Wallet Separation: Use different wallets for different activities.',
          'Selective Connection: Only connect your wallet to sites you trust.'
        ]
      }
    ]
  },
  'sec-wallet': {
    title: 'WALLET SECURITY',
    subtitle: 'Hardening Your Core',
    category: 'Security',
    sections: [
      {
        heading: 'Best Practices',
        text: 'Your wallet is the keys to your financial kingdom. Protecting it requires a multi-layered approach.',
        bullets: [
          'Hardware Wallets: Keep your assets offline for maximum safety.',
          '2FA: Use authenticator apps (like Authy or Google Authenticator).',
          'Physical Backup: Store your seed phrase on metal or paper in a fireproof safe.',
          'Revoke Permissions: Regularly use tools to disconnect your wallet from old dApps.'
        ]
      }
    ]
  },
  'sec-dapps': {
    title: 'DAPP VERIFICATION',
    subtitle: 'Verifying Before Trusting',
    category: 'Security',
    sections: [
      {
        heading: 'How to check a dApp',
        text: 'Before interacting with any protocol, perform these safety checks to avoid scams and malicious contracts.',
        bullets: [
          'Check the URL: Scammers often use "typosquatting" (e.g., uniswaap.org instead of uniswap.org).',
          'Verify TVL: Check sites like DeFiLlama to see the Total Value Locked.',
          'Search for Audits: Look for security reports from firms like CertiK or OpenZeppelin.',
          'Community Reputation: Check Twitter and Discord for any recent red flags.'
        ]
      }
    ]
  },
  'sec-sc': {
    title: 'SMART CONTRACT ALERTS',
    subtitle: 'Guardian of Your Assets',
    category: 'Security',
    sections: [
      {
        heading: 'Permission Management',
        text: 'When you "Approve" a smart contract, you are giving it permission to move tokens from your wallet. Malicious contracts can use this to drain your funds.',
        bullets: [
          'Unlimited Approvals: Be wary of contracts asking for "Unlimited" spending caps.',
          'Signature Verification: Carefully read the message you are signing in MetaMask.',
          'Revoke Access: Use tools like Revoke.cash to clean up your permissions.',
          'Simulate Transactions: Use browser extensions that show you what a tx will do before you sign.'
        ]
      }
    ]
  }
};
