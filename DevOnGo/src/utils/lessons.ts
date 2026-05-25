export type LessonDiagramKind =
  | 'web2-vs-web3'
  | 'install-safety'
  | 'connect-flow'
  | 'network-stack'
  | 'faucet-flow'
  | 'balance-rpc'
  | 'address-format'
  | 'transfer-receipt'
  | 'self-transfer'
  | 'hash-chain-integrity';

export interface LessonIntroCard {
  title: string;
  description: string;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  content: string;
  introDiagram: LessonDiagramKind;
  introCards: LessonIntroCard[];
  theoryBeforeQuiz: string;
  theoryBeforeTask?: string;
  questions: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
  web3Task?: {
    type:
      | 'swap'
      | 'mint'
      | 'sign'
      | 'deploy'
      | 'stake'
      | 'transfer'
      | 'blockchain-integrity'
      | 'check-balance'
      | 'check-hela-connection'
      | 'check-hela-faucet'
      | 'install-metamask'
      | 'send-to-self'
      | 'send-to-us'
      | 'wallet-address'
      | 'wallet-create-connect';
    title: string;
    description: string;
    steps: string[];
  };
}

export const lessons: Lesson[] = [
  {
    id: 'know-web3',
    title: 'Know About Web3',
    description: 'Learn what Web3 is and why wallets + blockchains matter before doing hands-on tasks.',
    content:
      'Web3 is a blockchain-powered internet layer where users control addresses and assets. Instead of logging in with a password, you connect a wallet and sign messages to prove you own an address.',
    introDiagram: 'web2-vs-web3',
    introCards: [
      {
        title: 'You hold the keys',
        description: 'A wallet manages cryptographic keys. Your address is public; the private key proves control and must stay secret.',
      },
      {
        title: 'Shared truth',
        description: 'Many nodes keep a copy of the ledger and agree on rules. That is what people mean by decentralized verification.',
      },
      {
        title: 'Sign vs send',
        description: 'Signing a message often costs nothing. Sending a transaction updates on-chain state and uses gas in the network token.',
      },
    ],
    theoryBeforeQuiz: `Web3 is the idea that users can own digital accounts and assets using cryptography, instead of relying only on a company's database. A blockchain is a shared ledger: many computers keep copies and follow the same rules to agree on balances and history.

A wallet is software that manages keys. Your public address is like a mailbox number people can send funds to. Your private key (never shared) is what lets you authorize spending or signing. When a dApp says "connect wallet," it usually wants to read your public address and sometimes ask you to sign a message or transaction.

Decentralization means no single party must be trusted to say what happened: many validators or nodes check blocks and transactions. If one node lies, the rest reject it.`,
    questions: [
      {
        question: 'In Web3, what does a wallet primarily store?',
        options: ['Coins directly', 'Private keys used to sign', 'Your email password', 'A copy of every block'],
        correctIndex: 1,
        explanation: 'Wallets store/manage private keys for signing; the blockchain stores balances and state.',
      },
      {
        question: 'What is the most common "login" action in a dApp?',
        options: ['SMS OTP', 'Connect wallet and sign a message', 'Email confirmation link', 'Face ID only'],
        correctIndex: 1,
        explanation: 'Signing a message proves you control the address without sharing secrets.',
      },
      {
        question: 'What does "decentralized" mean in blockchains?',
        options: ['One company owns all nodes', 'Many nodes share/verify the same ledger', 'No cryptography is used', 'Transactions happen offline'],
        correctIndex: 1,
        explanation: 'Multiple independent nodes validate and store the same ledger, reducing single points of control.',
      },
    ],
  },
  {
    id: 'install-metamask',
    title: 'Install MetaMask',
    description: 'Install the wallet extension you will use to connect, sign, and send transactions.',
    content:
      'MetaMask is a browser wallet that manages accounts and connects to networks. Always install from the official source and never share your seed phrase.',
    introDiagram: 'install-safety',
    introCards: [
      {
        title: 'Official sources only',
        description: 'Install from your browser’s extension store or metamask.io. Fake wallets steal seed phrases.',
      },
      {
        title: 'Seed phrase = full control',
        description: 'Twelve or twenty-four words can restore every account from that wallet. Never photograph or paste them online.',
      },
      {
        title: 'Pin and unlock',
        description: 'Pin the extension for quick access. Create a strong password for the local app lock—it is not the same as your seed.',
      },
    ],
    theoryBeforeQuiz: `MetaMask is a self-custody wallet that runs as a browser extension (or mobile app). It generates a seed phrase (12 or 24 words) that can restore all accounts derived from it. Anyone with the seed phrase controls your funds—treat it like a master password written in stone.

Install only from official stores or metamask.io. Malicious clones exist. After install, pin the extension, create or import a wallet, and never paste your seed into websites, "support" forms, or quizzes.

You will not send real money in this curriculum until you choose to; we focus on safe habits first.`,
    theoryBeforeTask: `In the task panel you will probe window.ethereum to see if MetaMask injected its provider. That is how many dApps detect a wallet. A successful check means the extension is present; you still must create or unlock an account inside MetaMask separately.`,
    questions: [
      {
        question: 'Where should you install MetaMask from?',
        options: ['Random websites', 'Official MetaMask listing/website', 'Email attachments', 'Popup "update now" ads'],
        correctIndex: 1,
        explanation: 'Only official sources reduce the risk of fake/malicious extensions.',
      },
      {
        question: 'What should you never share with anyone?',
        options: ['Your public address', 'Your seed phrase', 'A transaction hash', 'Your network name'],
        correctIndex: 1,
        explanation: 'Seed phrase exposure gives full control of the wallet.',
      },
    ],
    web3Task: {
      type: 'install-metamask',
      title: 'InstallMetaMask',
      description: 'Verify whether MetaMask is installed in your browser.',
      steps: ['Install the MetaMask extension', 'Pin MetaMask in your browser toolbar', 'Click “Verify Installation” in the task panel'],
    },
  },
  {
    id: 'wallet-create-connect',
    title: 'Create & Connect Wallet',
    description: 'Create a wallet (or use an existing one) and connect it to the app.',
    content:
      'Connecting a wallet lets the app read your public address and request message signatures or transactions. Message signing proves ownership and usually costs no gas.',
    introDiagram: 'connect-flow',
    introCards: [
      {
        title: 'Connect ≠ custody',
        description: 'The site asks your wallet to share an address and to route future signature or transaction requests. It does not receive your seed.',
      },
      {
        title: 'Approvals matter',
        description: 'Read the domain and permissions in MetaMask. Revoke unused allowances periodically in production use.',
      },
      {
        title: 'Practice wallet',
        description: 'For learning, a separate wallet used only on testnets limits blast radius if you mis-click.',
      },
    ],
    theoryBeforeQuiz: `Connect means the site gets permission to see your address and to request signatures or transactions through the wallet UI. It does not give the site your private key.

Sign message (off-chain): proves you control the address; usually free. Transaction (on-chain): changes state (transfer, contract call) and costs gas paid in the network’s native token.

Always read what MetaMask shows: which site is asking, which network is active, and the exact transaction details before you confirm.`,
    theoryBeforeTask: `The interactive panel will check whether an Ethereum provider exists and then request a standard connect flow. Approve only if you trust this learning app. If you use a fresh test wallet, there is little risk—you are practicing the muscle memory of approvals.`,
    questions: [
      {
        question: 'What becomes visible to a dApp after you connect your wallet?',
        options: ['Seed phrase', 'Public address', 'Bank details', 'Device files'],
        correctIndex: 1,
        explanation: 'A dApp can see your public address, but it should never see your seed phrase.',
      },
      {
        question: 'What typically requires gas fees?',
        options: ['Signing a message', 'Sending a transaction', 'Reading an address', 'Copying a tx hash'],
        correctIndex: 1,
        explanation: 'Transactions write to the blockchain and require gas; message signing usually does not.',
      },
    ],
    web3Task: {
      type: 'wallet-create-connect',
      title: 'WalletCreateAndConnect',
      description: 'Check and connect your MetaMask wallet.',
      steps: ['Click “Check Wallet”', 'If needed, click “Connect Wallet”', 'Approve the request in MetaMask'],
    },
  },
  {
    id: 'add-custom-network',
    title: 'Add Custom Network (Hela Testnet)',
    description: 'Add/switch to Hela Testnet so you can practice safely using test tokens.',
    content:
      'A custom network is defined by values like Chain ID and RPC URL. Always verify these parameters from trusted sources.',
    introDiagram: 'network-stack',
    introCards: [
      {
        title: 'Chain ID is the fingerprint',
        description: 'Wallets use Chain ID so transactions cannot be replayed on a different network by mistake.',
      },
      {
        title: 'RPC is your window',
        description: 'The RPC URL is how your wallet reads balances and sends transactions. Wrong RPC, wrong world.',
      },
      {
        title: 'Verify from Hela docs',
        description: 'Copy network parameters from official Hela documentation—not from random chat links.',
      },
    ],
    theoryBeforeQuiz: `EVM networks share the same address format (0x…) but state is per chain. Chain ID is baked into signatures so a transaction meant for one chain cannot be replayed on another.

To add a custom network you supply: network name, RPC URL, Chain ID, currency symbol, and optionally block explorer URL. Wrong RPC or ID can strand you on a fake chain or show wrong balances—always copy from official Hela documentation.

Testnets use worthless tokens so mistakes are learning moments, not financial disasters.`,
    theoryBeforeTask: `You will confirm MetaMask is pointed at Hela Testnet. If the chain is wrong, faucet claims and balances will not match what this course expects. Switch networks first, then run the verifier.`,
    questions: [
      {
        question: 'Why do we use a testnet for practice?',
        options: ['To avoid risking real funds', 'Because it has no rules', 'Because it is always faster', 'Because it cannot fail'],
        correctIndex: 0,
        explanation: 'Testnets use free tokens so you can learn without financial risk.',
      },
      {
        question: 'Which field uniquely identifies a network?',
        options: ['Chain ID', 'Wallet icon color', 'Gas limit', 'Address prefix'],
        correctIndex: 0,
        explanation: 'Chain ID distinguishes networks and prevents replay issues across chains.',
      },
    ],
    web3Task: {
      type: 'check-hela-connection',
      title: 'CheckHElaCOnnection',
      description: 'Verify Hela Testnet can be selected in MetaMask.',
      steps: ['Open MetaMask network selector', 'Add/switch to Hela Testnet', 'Click “Connect Now” to verify'],
    },
  },
  {
    id: 'get-test-token',
    title: 'Get Test Tokens',
    description: 'Use the faucet to obtain test HLUSD so you can pay gas and test transfers.',
    content:
      'A faucet gives you free testnet tokens. A good learning flow is: check balance, claim from faucet, then verify your balance increased.',
    introDiagram: 'faucet-flow',
    introCards: [
      {
        title: 'Why faucets exist',
        description: 'Validators still process your test transactions. Faucets distribute free gas tokens so developers and learners can experiment.',
      },
      {
        title: 'Rate limits',
        description: 'Many faucets throttle by address or IP. If a claim fails, wait and retry or use another official faucet.',
      },
      {
        title: 'Prove it landed',
        description: 'Compare balance before and after. That is the simplest sanity check that your wallet and network are aligned.',
      },
    ],
    theoryBeforeQuiz: `A faucet drips test tokens to your address so you can pay gas and experiment. Faucets may rate-limit by IP or address to prevent abuse.

Workflow: note your balance and address, request from the official faucet, wait for confirmation, then read balance again. If balance does not move, you may be on the wrong network, wrong address, or the faucet may be empty—debug systematically.

Tokens on testnets have no monetary value; they exist to mimic real usage.`,
    theoryBeforeTask: `The verifier compares “before” and “after” balances from the chain. Claim from the faucet first, wait until the transaction confirms, then click verify in the task UI so the numbers reflect the new state.`,
    questions: [
      {
        question: 'What is the purpose of a faucet?',
        options: ['To buy tokens with a card', 'To receive free testnet tokens', 'To store seed phrases', 'To speed up the internet'],
        correctIndex: 1,
        explanation: 'Faucets distribute free tokens on testnets for development and learning.',
      },
      {
        question: 'Why check your balance before and after claiming?',
        options: ['To see if tokens were received', 'To reset MetaMask', 'To change your address', 'To increase gas automatically'],
        correctIndex: 0,
        explanation: 'Balance comparison confirms that your claim worked and tokens arrived.',
      },
    ],
    web3Task: {
      type: 'check-hela-faucet',
      title: 'getTestToken',
      description: 'Verify that test tokens were received after claiming from a faucet.',
      steps: ['Check your initial balance', 'Claim tokens from the Hela faucet', 'Click “Verify After Claim” to confirm balance increased'],
    },
  },
  {
    id: 'check-balance',
    title: 'Check Balance',
    description: 'Learn how to check your wallet balance and understand what it represents.',
    content:
      'Wallet balances are on-chain data. Your wallet app shows balances by querying an RPC provider.',
    introDiagram: 'balance-rpc',
    introCards: [
      {
        title: 'State, not storage',
        description: 'Coins live as ledger entries. MetaMask displays what RPC nodes report for your address on the active chain.',
      },
      {
        title: 'Per-network balances',
        description: 'The same 0x address exists on many EVM chains, but balances are independent per network.',
      },
      {
        title: 'Native vs tokens',
        description: 'Native gas token balance is separate from ERC-20 balances. Always check which asset you are viewing.',
      },
    ],
    theoryBeforeQuiz: `Balances live in chain state, not “inside” MetaMask. The wallet asks an RPC node for account storage (native balance, token balances via contracts, etc.) and formats the answer.

Different tokens (ERC-20) have separate balances per contract. Native gas token balance is separate. Always check the active network in the wallet header—mainnet ETH ≠ testnet HLUSD.

RPC providers can be wrong or laggy; for critical amounts, cross-check explorers.`,
    theoryBeforeTask: `You will type the human-readable balance you see in MetaMask and the app will read the chain to confirm they match for your connected address. Small rounding differences are normal; follow the task’s formatting hints.`,
    questions: [
      {
        question: 'Is your balance the same on every network?',
        options: ['Yes, balance is global', 'No, balances exist per chain/network', 'Only on weekends', 'Only on testnets'],
        correctIndex: 1,
        explanation: 'An address can exist on multiple networks; each network has its own state and balances.',
      },
      {
        question: 'What does an RPC provider do for your wallet?',
        options: ['Stores your seed phrase', 'Lets you query blockchain data like balances', 'Mints NFTs automatically', 'Pays gas fees'],
        correctIndex: 1,
        explanation: 'RPC endpoints let wallets/dApps read blockchain state and send transactions.',
      },
    ],
    web3Task: {
      type: 'check-balance',
      title: 'CheckBalence',
      description: 'Enter your expected balance and verify it matches what MetaMask reports.',
      steps: ['Open MetaMask and view your balance', 'Enter the same balance into the task', 'Click “Verify Balance”'],
    },
  },
  {
    id: 'wallet-address',
    title: 'Wallet Address',
    description: 'Understand what a wallet address is and how to validate it before sending funds.',
    content:
      'A wallet address is a public identifier (e.g., starts with 0x on EVM chains). You can share it to receive funds.',
    introDiagram: 'address-format',
    introCards: [
      {
        title: 'Public identifier',
        description: 'An EVM address is 20 bytes, shown as hex with 0x. Share it to receive funds; never share keys.',
      },
      {
        title: 'Checksums help',
        description: 'Mixed-case addresses (EIP-55) catch many typos. Wallets usually copy the checksummed form.',
      },
      {
        title: 'Clipboard risk',
        description: 'Malware can replace an address after you copy. Compare several characters at start and end.',
      },
    ],
    theoryBeforeQuiz: `On Ethereum-compatible chains, externally owned accounts use 20-byte addresses shown as hex with 0x prefix (40 hex chars). Addresses are derived from public keys; only the holder of the matching private key can move funds.

Checksumming (mixed-case EIP-55) helps catch typos. Malware can alter clipboard addresses—compare several prefix and suffix characters when pasting large amounts.

You can share your address to receive funds; never share keys or seed phrases.`,
    theoryBeforeTask: `The task checks format and checksum when applicable. Practice copying from MetaMask’s “copy address” button instead of retyping long hex by hand.`,
    questions: [
      {
        question: 'What is safe to share publicly?',
        options: ['Seed phrase', 'Private key', 'Public wallet address', 'Recovery words screenshot'],
        correctIndex: 2,
        explanation: 'Public addresses can be shared; secrets like seed phrases must never be shared.',
      },
      {
        question: 'Why should you validate an address before sending?',
        options: ['To increase speed', 'To avoid sending to an invalid/wrong destination', 'To reduce gas to zero', 'To change the token'],
        correctIndex: 1,
        explanation: 'Transactions are irreversible; validation reduces user error.',
      },
    ],
    web3Task: {
      type: 'wallet-address',
      title: 'Wallet address',
      description: 'Enter an address and validate whether it is correctly formatted.',
      steps: ['Copy a wallet address (0x...)', 'Paste it into the task input', 'Click “Verify Address”'],
    },
  },
  {
    id: 'send-to-us',
    title: 'Send To Us',
    description: 'Practice sending a transaction to a receiver address and verify it on-chain.',
    content:
      'A transfer is an on-chain transaction from one address to another. Always verify the receiver address and network before sending.',
    introDiagram: 'transfer-receipt',
    introCards: [
      {
        title: 'Triple-check the to field',
        description: 'Wrong address or wrong chain means funds can be gone forever. Copy from a trusted source.',
      },
      {
        title: 'Receipt is proof',
        description: 'A transaction hash anchors from, to, value, and status. Explorers make it human-readable.',
      },
      {
        title: 'Start small',
        description: 'Send a minimal test amount first when pairing a new address with a new workflow.',
      },
    ],
    theoryBeforeQuiz: `A simple transfer updates ledger balances and emits a transaction receipt with from, to, value, and hash. Explorers index this so anyone can audit.

Gas is paid by the sender. Wrong network or wrong token type means funds may not arrive where you expect—even if the tx “succeeds” on some other chain.

Always send a tiny test amount first when dealing with new addresses or contracts.`,
    theoryBeforeTask: `You will paste a destination address and your transaction hash. The verifier confirms the chain shows your wallet as sender and the destination as receiver. Keep the explorer tab open to double-check values.`,
    questions: [
      {
        question: 'What can you use to verify where a transfer was sent?',
        options: ['Seed phrase', 'Transaction hash', 'Wallet theme', 'Browser history'],
        correctIndex: 1,
        explanation: 'A transaction hash lets you fetch details like from/to/value on a block explorer or via RPC.',
      },
      {
        question: 'What happens if you send to the wrong address?',
        options: ['It automatically returns', 'It can be irreversible', 'Support can cancel it', 'It pauses until you confirm later'],
        correctIndex: 1,
        explanation: 'Most blockchain transfers are irreversible once confirmed.',
      },
    ],
    web3Task: {
      type: 'send-to-us',
      title: 'SendToUs',
      description: 'Paste a receiver address and tx hash to verify the transfer was from you to that receiver.',
      steps: ['Send a small test transfer to the receiver address', 'Copy the transaction hash', 'Paste receiver + tx hash into the task and verify'],
    },
  },
  {
    id: 'send-to-self',
    title: 'Send To Self',
    description: 'Send a transaction to your own address and verify it using the tx hash.',
    content:
      'Self-transfers are useful for practice and verification. The key idea is that the sender and receiver are the same address.',
    introDiagram: 'self-transfer',
    introCards: [
      {
        title: 'Same from and to',
        description: 'The receipt should show your address on both sides. That is the definition used by verifiers.',
      },
      {
        title: 'Gas still applies',
        description: 'Validators did work to include your transaction, so you still pay network fees.',
      },
      {
        title: 'Practice reading receipts',
        description: 'Self-transfers are a safe way to learn explorer fields before you send to others.',
      },
    ],
    theoryBeforeQuiz: `Self-transfers still consume gas because the network executes the transaction and updates state—even if net token balance for your account might look similar after (minus gas). They are useful to test wallets, consolidate UTXO-like patterns on other systems, or trigger events in advanced flows.

For learning, they let you practice reading from == to on a receipt without counterparty risk.`,
    theoryBeforeTask: `Submit the transaction hash of a transfer you sent to your own address. The verifier parses receipt fields to ensure from and to match your connected account.`,
    questions: [
      {
        question: 'In a self-transfer, which statement is true?',
        options: ['from != to', 'from == to', 'Gas is always zero', 'It cannot be verified'],
        correctIndex: 1,
        explanation: 'A self-transfer has the same sender and receiver address.',
      },
      {
        question: 'What do you need to look up a transaction on-chain?',
        options: ['Transaction hash', 'Seed phrase', 'Email address', 'Password'],
        correctIndex: 0,
        explanation: 'The transaction hash uniquely identifies the transaction.',
      },
    ],
    web3Task: {
      type: 'send-to-self',
      title: 'SendToSelf',
      description: 'Paste a transaction hash and verify it was a self-transfer.',
      steps: ['Send a small amount to your own address', 'Copy the tx hash from MetaMask activity', 'Paste tx hash into the task and verify'],
    },
  },
  {
    id: 'blockchain-integrity',
    title: 'Blockchain integrity & hash links',
    description: 'See why changing one block’s data breaks the chain—then play with the interactive demo.',
    content:
      'Blocks reference the previous block’s hash. Tampering with data changes hashes and breaks the link, which is the core integrity idea behind many blockchains.',
    introDiagram: 'hash-chain-integrity',
    introCards: [
      {
        title: 'Order matters',
        description: 'Each block includes a pointer to the parent hash. Nodes reject sequences that do not line up.',
      },
      {
        title: 'Hash sensitivity',
        description: 'Changing even one character of payload data produces a different fingerprint (hash).',
      },
      {
        title: 'Why you should care',
        description: 'Integrity rules are why history is hard to rewrite without redoing expensive work (proof-of-work) or losing votes (proof-of-stake).',
      },
    ],
    theoryBeforeQuiz: `Think of a blockchain as a journal where each page ends with a tamper-evident seal. That seal summarizes everything on the page so far, including the seal of the previous page.

If someone edits an old page, the seal no longer matches the content. The next page still remembers the old seal, so the mismatch is easy to detect.

Cryptographic hashes make those seals mathematical instead of physical. The hands-on task lets you edit simulated block data and watch where the chain visually “breaks.”`,
    theoryBeforeTask: `Open the interactive panel below. Change data inside a block and observe how the link to the next block fails when the previous hash no longer matches. That is the same intuition used by real clients when validating chains.`,
    questions: [
      {
        question: 'What happens if a block’s data is changed but its hash is not recomputed consistently with the parent?',
        options: ['Nothing; chains ignore hashes', 'The next block’s prev-hash link may no longer match', 'Gas becomes negative', 'Addresses automatically rotate'],
        correctIndex: 1,
        explanation: 'Each block’s identity depends on content; neighbors enforce continuity via previous-hash pointers.',
      },
      {
        question: 'Why do blockchains use hash links between blocks?',
        options: ['To make wallets faster', 'To make tampering detectable without trusting one server', 'To replace signatures', 'To hide transaction amounts'],
        correctIndex: 1,
        explanation: 'Hash chaining binds history so inconsistent edits stand out to validating nodes.',
      },
    ],
    web3Task: {
      type: 'blockchain-integrity',
      title: 'Blockchain integrity lab',
      description: 'Interact with the demo: edit block data and see the integrity break.',
      steps: ['Read the on-screen instructions in the lab', 'Try changing text in an earlier block', 'Observe which link turns invalid and reset if needed'],
    },
  },
];
