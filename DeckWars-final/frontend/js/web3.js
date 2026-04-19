/**
 * web3.js — DeckWars shared Web3 utilities
 * Handles: MetaMask connection, contract ABI loading, network switching
 */

// ─── CONFIG ─────────────────────────────────────────────────────────────────
const HELA_TESTNET = {
  chainId: '0xA2F48',   // 666888 in hex
  chainName: 'HeLa Testnet',
  nativeCurrency: { name: 'HLUSD', symbol: 'HLUSD', decimals: 18 },
  rpcUrls: ['https://testnet-rpc.helachain.com'],
  blockExplorerUrls: ['https://testnet-blockexplorer.helachain.com']
};

// ABIs (minimal — only functions we call from frontend)
const CARD_ABI = [
  "function mintCard(uint256 templateId) external returns (uint256)",
  "function getCardStats(uint256 tokenId) external view returns (tuple(string name, uint8 cardClass, uint256 hp, uint256 maxHp, uint256 attack, uint256 defense, uint256 speed, address[4] moves, uint8 moveCount, uint8 rarity))",
  "function getOwnedCards(address owner) external view returns (uint256[])",
  "function templateCount() external view returns (uint256)",
  "function templates(uint256) external view returns (string name, uint8 cardClass, uint256 hp, uint256 attack, uint256 defense, uint256 speed, uint8 rarity)",
  "function balanceOf(address owner) external view returns (uint256)",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "event CardMinted(address indexed to, uint256 indexed tokenId, string cardName, uint8 cardClass)"
];

const GAME_ABI = [
  "function openChallenge(address opponent, uint256[3] calldata cardIds) external payable returns (uint256)",
  "function acceptChallenge(uint256 gameId, uint256[3] calldata cardIds) external payable",
  "function commitMove(uint256 gameId, bytes32 commitHash) external",
  "function revealMove(uint256 gameId, uint8 moveIndex, uint256 secret) external",
  "function forfeit(uint256 gameId) external",
  "function claimTimeout(uint256 gameId) external",
  "function generateCommitHash(uint8 moveIndex, uint256 secret, address player) external pure returns (bytes32)",
  "function getGame(uint256 gameId) external view returns (tuple(uint256 id, tuple(address addr, uint256[3] cardIds, tuple(uint256 hp, uint256 maxHp, uint256 attack, uint256 defense, uint256 speed)[3] cards, uint8 activeCardIdx, bytes32 commitHash, uint8 revealedMove, uint256 revealedSeed, uint8 commitStatus, bool hasForfeited) player1, tuple(address addr, uint256[3] cardIds, tuple(uint256 hp, uint256 maxHp, uint256 attack, uint256 defense, uint256 speed)[3] cards, uint8 activeCardIdx, bytes32 commitHash, uint8 revealedMove, uint256 revealedSeed, uint8 commitStatus, bool hasForfeited) player2, uint8 status, uint256 wager, address winner, uint256 turnNumber, uint256 lastActionTime, uint256 createdAt))",
  "function gameCounter() external view returns (uint256)",
  "event ChallengeOpened(uint256 indexed gameId, address indexed challenger, address indexed opponent, uint256 wager)",
  "event ChallengeAccepted(uint256 indexed gameId, address indexed player2)",
  "event MoveCommitted(uint256 indexed gameId, address indexed player, uint256 turnNumber)",
  "event MoveRevealed(uint256 indexed gameId, address indexed player, uint8 moveIndex, uint256 turnNumber)",
  "event TurnResolved(uint256 indexed gameId, uint256 turnNumber, uint256 combinedSeed)",
  "event CardFainted(uint256 indexed gameId, bool player1Card, uint8 cardIdx)",
  "event GameOver(uint256 indexed gameId, address indexed winner, uint256 prize)"
];

const MOVE_ABI = [
  "function name() external pure returns (string)",
  "function description() external pure returns (string)",
  "function power() external pure returns (uint8)"
];

// ─── STATE ───────────────────────────────────────────────────────────────────
window.DW = {
  provider: null,
  signer: null,
  userAddress: null,
  cardContract: null,
  gameContract: null,
  deployment: null,
  moveInfoCache: {},
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function shortAddr(addr) {
  if (!addr) return '';
  return addr.slice(0, 6) + '...' + addr.slice(-4);
}

function toast(message, type = 'info', duration = 4000) {
  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
  const container = document.getElementById('toast-container');
  if (!container) return;
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span>${icons[type]}</span><span>${message}</span>`;
  container.appendChild(el);
  setTimeout(() => el.remove(), duration + 400);
}

function setBtn(id, text, disabled = false) {
  const el = document.getElementById(id);
  if (el) { el.innerHTML = text; el.disabled = disabled; }
}

const CLASS_NAMES  = ['Warrior', 'Mage', 'Rogue', 'Paladin', 'Ranger'];
const CLASS_ICONS  = { Warrior:'⚔️', Mage:'🔮', Rogue:'🗡️', Paladin:'🛡️', Ranger:'🏹' };
const CLASS_COLORS = { Warrior:'var(--warrior)', Mage:'var(--mage)', Rogue:'var(--rogue)', Paladin:'var(--paladin)', Ranger:'var(--ranger)' };
const RARITY_LABELS = { 1:'Common', 2:'Rare', 3:'Epic', 4:'Legendary' };

function buildCardHTML(tokenId, stats, selected = false) {
  const cls = CLASS_NAMES[Number(stats.cardClass)] || 'Warrior';
  const icon = CLASS_ICONS[cls] || '⚔️';
  const color = CLASS_COLORS[cls] || 'var(--cyan)';
  const rarity = Number(stats.rarity);
  const hpPct = Math.round(Number(stats.hp) / Number(stats.maxHp) * 100);
  const hpColor = hpPct > 60 ? '#22c55e' : hpPct > 30 ? '#f59e0b' : '#ef4444';
  return `
    <div class="nft-card rarity-${rarity} ${selected ? 'selected-card' : ''}" 
         data-token="${tokenId}"
         onclick="handleCardClick(${tokenId})">
      <div class="card-header">
        <div class="card-class-bg" style="background:radial-gradient(circle at 50% 50%, ${color}, transparent 70%);"></div>
        <span class="card-icon" style="color:${color};">${icon}</span>
        <div class="card-rarity-bar"></div>
      </div>
      <div class="card-body">
        <div class="card-name">#${tokenId} ${stats.name}</div>
        <div class="card-class-label class-${cls}">${cls} · ${RARITY_LABELS[rarity]}</div>
        <div class="card-stats">
          <div class="stat-item"><span class="stat-icon">❤️</span><span class="stat-label">HP</span><span class="stat-value">${stats.hp}</span></div>
          <div class="stat-item"><span class="stat-icon">⚔️</span><span class="stat-label">ATK</span><span class="stat-value">${stats.attack}</span></div>
          <div class="stat-item"><span class="stat-icon">🛡️</span><span class="stat-label">DEF</span><span class="stat-value">${stats.defense}</span></div>
          <div class="stat-item"><span class="stat-icon">⚡</span><span class="stat-label">SPD</span><span class="stat-value">${stats.speed}</span></div>
        </div>
        <div class="card-hp-bar">
          <div class="card-hp-fill" style="width:${hpPct}%; background:${hpColor};"></div>
        </div>
      </div>
    </div>`;
}

function buildMiniBenchCard(stats, isActive, isFainted) {
  const cls = CLASS_NAMES[Number(stats.cardClass)] || 'Warrior';
  const icon = CLASS_ICONS[cls] || '⚔️';
  const hpPct = Number(stats.maxHp) > 0 ? Math.round(Number(stats.hp) / Number(stats.maxHp) * 100) : 0;
  return `
    <div class="bench-card ${isFainted ? 'fainted' : ''} ${isActive ? 'active-bench' : ''}">
      <span class="bench-icon">${icon}</span>
      <div style="font-size:0.65rem; color:var(--text-secondary);">${hpPct}%</div>
    </div>`;
}

// ─── WALLET CONNECTION ───────────────────────────────────────────────────────

async function connectWallet() {
  if (typeof window.ethereum === 'undefined') {
    toast('MetaMask not found! Please install MetaMask.', 'error');
    window.open('https://metamask.io/download/', '_blank');
    return;
  }

  try {
    setBtn('connect-btn', '<span class="spinner"></span> Connecting...', true);

    // Request accounts
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

    // Load ethers dynamically
    if (!window.ethers) {
      await loadEthers();
    }

    DW.provider = new ethers.BrowserProvider(window.ethereum);
    DW.signer = await DW.provider.getSigner();
    DW.userAddress = accounts[0];

    // Switch to HeLa Testnet if needed
    await switchToHela();

    // Load deployment info
    await loadDeployment();

    // Update UI
    updateWalletUI();
    toast(`Connected: ${shortAddr(DW.userAddress)}`, 'success');

    // Page-specific init
    if (typeof onWalletConnected === 'function') onWalletConnected();

    // Listen for account/chain changes
    window.ethereum.on('accountsChanged', () => location.reload());
    window.ethereum.on('chainChanged', () => location.reload());

  } catch (err) {
    console.error(err);
    toast('Failed to connect: ' + (err.message || err), 'error');
    setBtn('connect-btn', '🔗 Connect Wallet', false);
  }
}

async function loadEthers() {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.ethers.io/lib/ethers-5.7.2.umd.min.js';
    script.onload = resolve;
    script.onerror = () => {
      // Fallback to v6 CDN
      const s2 = document.createElement('script');
      s2.src = 'https://cdn.jsdelivr.net/npm/ethers@6.13.4/dist/ethers.umd.min.js';
      s2.onload = resolve;
      s2.onerror = reject;
      document.head.appendChild(s2);
    };
    document.head.appendChild(script);
  });
}

async function switchToHela() {
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: HELA_TESTNET.chainId }]
    });
  } catch (switchErr) {
    if (switchErr.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [HELA_TESTNET]
        });
      } catch (addErr) {
        if (addErr.message && addErr.message.includes("Could not add network that points to same RPC")) {
          // Ignore, network mapping conflict but user is likely connected or can manual switch
          console.warn("RPC exists under a different chain configuration. Continuing.");
        } else {
          throw addErr;
        }
      }
    } else {
      throw switchErr;
    }
  }
}

async function loadDeployment() {
  // Try relative paths for both root and /pages/ subdirectory
  const paths = ['js/deployment.json', '../js/deployment.json', 'deployment.json'];
  for (const p of paths) {
    try {
      const resp = await fetch(p);
      if (resp.ok) {
        DW.deployment = await resp.json();
        console.log('Loaded deployment:', DW.deployment);

        // Instantiate contracts
        DW.cardContract = new ethers.Contract(
          DW.deployment.contracts.DeckWarsCard,
          CARD_ABI,
          DW.signer
        );
        DW.gameContract = new ethers.Contract(
          DW.deployment.contracts.DeckWarsGame,
          GAME_ABI,
          DW.signer
        );
        return;
      }
    } catch (_) {}
  }
  toast('deployment.json not found — deploy contracts first!', 'warning');
}

function updateWalletUI() {
  const btn = document.getElementById('connect-btn');
  if (btn) {
    btn.textContent = shortAddr(DW.userAddress);
    btn.disabled = false;
    btn.style.background = 'rgba(34,197,94,0.15)';
    btn.style.borderColor = 'rgba(34,197,94,0.4)';
    btn.style.color = 'var(--green)';
  }

  const dot = document.getElementById('network-dot');
  const name = document.getElementById('network-name');
  if (dot) dot.style.background = 'var(--green)';
  if (name) name.textContent = 'HeLa Testnet';

  // Hide wallet prompts
  const prompt = document.getElementById('wallet-prompt');
  if (prompt) prompt.style.display = 'none';
}

async function getMoveInfo(moveAddr) {
  if (!moveAddr || moveAddr === ethers.ZeroAddress) {
    return { name: '—', description: 'No move', power: 0 };
  }
  if (DW.moveInfoCache[moveAddr]) return DW.moveInfoCache[moveAddr];
  try {
    const contract = new ethers.Contract(moveAddr, MOVE_ABI, DW.provider);
    const [name, description, power] = await Promise.all([
      contract.name(), contract.description(), contract.power()
    ]);
    const info = { name, description, power: Number(power) };
    DW.moveInfoCache[moveAddr] = info;
    return info;
  } catch {
    return { name: 'Unknown Move', description: '', power: 0 };
  }
}

// Auto-connect if previously authorized
(async () => {
  if (typeof window.ethereum !== 'undefined') {
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    if (accounts.length > 0) {
      connectWallet();
    }
  }
})();
