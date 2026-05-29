/**
 * HELWAVE - Music NFT Platform
 * Pure ethers.js + MetaMask - No thirdweb
 * Design: JetBrains Mono, #000000 bg, #00ff88 accent
 */

// ==================== GLOBAL STATE ====================
let provider;      // ethers.BrowserProvider - reads blockchain
let signer;        // ethers.Signer - signs transactions
let userAddress;   // Connected wallet address

// ==================== CONTRACT CONFIG ====================
// Update these after: npx hardhat run scripts/deploy.js --network helaTestnet
const CONTRACT_ADDRESSES = {
  musicNFT: "0x0000000000000000000000000000000000000000",
  playlistNFT: "0x0000000000000000000000000000000000000000",
  guildRegistry: "0x0000000000000000000000000000000000000000",
  treasury: "0x0000000000000000000000000000000000000000"
};

// ==================== ABIs ====================
const MUSIC_NFT_ABI = [
  "function mint(address to, uint256 quantity, string memory uri, string memory coverHash, string memory genre, uint256 duration, address royaltyRecipient, uint16 royaltyBps) external",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function tokenURI(uint256 tokenId) view returns (string)"
];

const PLAYLIST_NFT_ABI = [
  "function createPlaylist(string memory name, string memory description, uint256[] memory initialTrackIds, uint256 curationFee) external returns (uint256)",
  "function addTrack(uint256 playlistId, uint256 trackId) external",
  "function followPlaylist(uint256 playlistId) external payable",
  "function getPlaylist(uint256 playlistId) view returns (string memory name, string memory description, uint256[] memory trackIds, uint256 followerCount, uint256 curationFee, address creator)"
];

const GUILD_REGISTRY_ABI = [
  "function createGuild(string memory name, string memory description, address[] memory initialAdmins, bool isPublic) external returns (uint256)",
  "function joinGuild(uint256 guildId) external",
  "function assignRole(uint256 guildId, address member, uint8 role) external",
  "function getGuild(uint256 guildId) view returns (string memory name, string memory description, address treasury, address[] memory admins, bool isPublic, uint256 createdAt)",
  "function totalGuilds() view returns (uint256)",
  "function isMember(uint256 guildId, address member) view returns (bool)",
  "function getRole(uint256 guildId, address member) view returns (uint8)"
];

const TREASURY_ABI = [
  "function submitTransaction(address to, uint256 value, bytes memory data) external returns (uint256)",
  "function confirmTransaction(uint256 txId) external",
  "function executeTransaction(uint256 txId) external",
  "function getBalance() view returns (uint256)",
  "function transactionCount() view returns (uint256)"
];

// ==================== WALLET CONNECTION ====================
/**
 * Connect to MetaMask via window.ethereum
 * 1. Check if MetaMask is installed
 * 2. Request account access (opens MetaMask popup)
 * 3. Create ethers.BrowserProvider (read-only blockchain access)
 * 4. Get signer (can sign transactions)
 * 5. Store user address
 */
async function connectWallet() {
  const statusEl = document.getElementById('walletStatus');
  
  if (typeof window.ethereum === 'undefined') {
    alert('METAMASK NOT FOUND\n\nInstall from: https://metamask.io');
    return;
  }

  try {
    // Request wallet connection
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    
    // Create provider - wraps MetaMask's window.ethereum
    // BrowserProvider = read-only access to blockchain
    provider = new ethers.BrowserProvider(window.ethereum);
    
    // Get signer - can modify blockchain state (send transactions)
    signer = await provider.getSigner();
    
    // Get connected wallet address
    userAddress = await signer.getAddress();
    
    // Update UI
    statusEl.textContent = `${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`;
    document.getElementById('connectBtn').style.display = 'none';
    
    console.log('[HELWAVE] Wallet connected:', userAddress);
  } catch (err) {
    console.error('[HELWAVE] Connection failed:', err);
    alert(`CONNECTION FAILED: ${err.message || 'Unknown error'}`);
  }
}

// ==================== PAGE ROUTING ====================
let currentPage = 'home';

function showPage(page) {
  currentPage = page;
  const content = document.getElementById('content');
  
  switch (page) {
    case 'home':
      content.innerHTML = `
        <div class="hero">
          <h1>HELWAVE</h1>
          <p>MINT. CURATE. EARN. ON HELA BLOCKCHAIN.</p>
          <div class="cursor-block"></div>
        </div>
        <div class="card-grid">
          <div class="card">
            <h3>♪ MINT MUSIC NFTS</h3>
            <p>Upload your music, set royalties, and mint NFTs</p>
            <button class="btn-primary" onclick="showPage('mint')">GO TO MINT</button>
          </div>
          <div class="card">
            <h3>≡ CURATE PLAYLISTS</h3>
            <p>Create and follow playlists, earn curation fees</p>
            <button class="btn-primary" onclick="showPage('playlists')">VIEW PLAYLISTS</button>
          </div>
          <div class="card">
            <h3>◈ DAO & GUILDS</h3>
            <p>Join guilds, vote on proposals, manage treasuries</p>
            <button class="btn-primary" onclick="showPage('guilds')">EXPLORE GUILDS</button>
          </div>
        </div>
      `;
      break;
      
    case 'mint':
      content.innerHTML = `
        <h2>MINT MUSIC NFT</h2>
        <div class="card">
          <div class="form-grid">
            <div>
              <label>TRACK NAME</label>
              <input type="text" id="trackName" placeholder="Enter track name">
            </div>
            <div>
              <label>ARTIST</label>
              <input type="text" id="artist" placeholder="Artist name">
            </div>
            <div>
              <label>GENRE</label>
              <input type="text" id="genre" placeholder="e.g., Electronic, Rock">
            </div>
            <div>
              <label>DURATION (SECONDS)</label>
              <input type="number" id="duration" placeholder="180">
            </div>
            <div class="full-width">
              <label>AUDIO FILE (IPFS)</label>
              <input type="file" id="audioFile" accept="audio/*">
            </div>
            <div class="full-width">
              <label>COVER ART (IPFS)</label>
              <input type="file" id="coverFile" accept="image/*">
            </div>
            <div>
              <label>ROYALTY RECIPIENT (LEAVE EMPTY FOR SELF)</label>
              <input type="text" id="royaltyRecipient" placeholder="0x...">
            </div>
            <div>
              <label>ROYALTY BPS (100 = 1%)</label>
              <input type="number" id="royaltyBps" value="500" placeholder="500 = 5%">
            </div>
          </div>
          <button class="btn-primary full-width" onclick="mintNFT()" style="margin-top: 16px;">MINT NFT</button>
          <p id="mintStatus" class="status"></p>
        </div>
      `;
      break;
      
    case 'playlists':
      content.innerHTML = `
        <h2>PLAYLISTS</h2>
        <div class="card">
          <h3>CREATE NEW PLAYLIST</h3>
          <div class="form-grid">
            <div class="full-width">
              <label>PLAYLIST NAME</label>
              <input type="text" id="playlistName" placeholder="Playlist name">
            </div>
            <div class="full-width">
              <label>DESCRIPTION</label>
              <textarea id="playlistDesc" placeholder="Description"></textarea>
            </div>
            <div>
              <label>CURATION FEE (WEI)</label>
              <input type="number" id="curationFee" value="0" placeholder="0 = free">
            </div>
          </div>
          <button class="btn-primary" onclick="createPlaylist()" style="margin-top: 16px;">CREATE PLAYLIST</button>
        </div>
        <div id="playlistsList"></div>
      `;
      break;
      
    case 'guilds':
      content.innerHTML = `
        <h2>DAO GUILDS</h2>
        <div class="card">
          <h3>CREATE NEW GUILD</h3>
          <div class="form-grid">
            <div class="full-width">
              <label>GUILD NAME</label>
              <input type="text" id="guildName" placeholder="Guild name">
            </div>
            <div class="full-width">
              <label>DESCRIPTION</label>
              <textarea id="guildDesc" placeholder="Description"></textarea>
            </div>
            <div class="full-width">
              <label>
                <input type="checkbox" id="guildPublic" checked>
                PUBLIC GUILD (ANYONE CAN JOIN)
              </label>
            </div>
          </div>
          <button class="btn-primary" onclick="createGuild()" style="margin-top: 16px;">CREATE GUILD</button>
          <p id="guildStatus" class="status"></p>
        </div>
        <div id="guildsList"></div>
      `;
      loadGuilds();
      break;
      
    case 'treasury':
      content.innerHTML = `
        <h2>TREASURY</h2>
        <div class="card">
          <div class="balance-display">
            TREASURY BALANCE: <span id="treasuryBalance">LOADING...</span> WEI
          </div>
          <div class="form-grid">
            <div class="full-width">
              <label>TO ADDRESS</label>
              <input type="text" id="txTo" placeholder="0x...">
            </div>
            <div class="full-width">
              <label>VALUE (WEI)</label>
              <input type="text" id="txValue" placeholder="1000000000000000000">
            </div>
          </div>
          <button class="btn-primary full-width" onclick="submitTransaction()" style="margin-top: 16px;">SUBMIT TRANSACTION</button>
          <p id="txStatus" class="status"></p>
        </div>
      `;
      loadTreasuryBalance();
      break;
  }
}

// ==================== MINT NFT ====================
/**
 * Mint a new Music NFT
 * Flow: Check wallet → Create contract → Call mint() → Wait for confirmation
 */
async function mintNFT() {
  if (!signer) {
    alert('CONNECT WALLET FIRST');
    return;
  }
  
  const statusEl = document.getElementById('mintStatus');
  statusEl.textContent = 'MINTING...';
  statusEl.className = 'status';
  
  try {
    // Create contract instance with signer (can write to blockchain)
    const contract = new ethers.Contract(
      CONTRACT_ADDRESSES.musicNFT,
      MUSIC_NFT_ABI,
      signer
    );
    
    // In production: upload to Pinata/IPFS first, then use returned hashes
    const audioHash = "ipfs://QmTestAudio123";
    const coverHash = "ipfs://QmTestCover456";
    
    // Call mint function
    const tx = await contract.mint(
      userAddress,           // to: who receives the NFT
      1,                      // quantity: how many to mint
      audioHash,             // uri: IPFS hash for audio
      coverHash,             // coverHash: IPFS hash for cover
      "Electronic",          // genre
      180,                   // duration in seconds
      userAddress,           // royaltyRecipient (self)
      500                    // royaltyBps (500 = 5%)
    );
    
    statusEl.textContent = 'TRANSACTION SENT: ' + tx.hash.slice(0, 10) + '...';
    
    // Wait for transaction to be mined
    const receipt = await tx.wait();
    
    statusEl.textContent = 'NFT MINTED SUCCESSFULLY! TX: ' + tx.hash.slice(0, 10) + '...';
    statusEl.className = 'status success';
    
    console.log('[HELWAVE] Mint tx:', receipt);
  } catch (err) {
    console.error('[HELWAVE] Mint failed:', err);
    statusEl.textContent = 'ERROR: ' + (err.reason || err.message || 'Unknown error');
    statusEl.className = 'status error';
  }
}

// ==================== CREATE PLAYLIST ====================
async function createPlaylist() {
  if (!signer) {
    alert('CONNECT WALLET FIRST');
    return;
  }
  
  const name = document.getElementById('playlistName').value;
  const desc = document.getElementById('playlistDesc').value;
  const fee = document.getElementById('curationFee').value || '0';
  
  if (!name) {
    alert('ENTER PLAYLIST NAME');
    return;
  }
  
  try {
    const contract = new ethers.Contract(
      CONTRACT_ADDRESSES.playlistNFT,
      PLAYLIST_NFT_ABI,
      signer
    );
    
    const tx = await contract.createPlaylist(
      name,
      desc,
      [],                    // initialTrackIds (empty for now)
      ethers.parseEther(fee)  // curationFee in wei
    );
    
    alert('TRANSACTION SENT: ' + tx.hash);
    await tx.wait();
    alert('PLAYLIST CREATED SUCCESSFULLY!');
  } catch (err) {
    alert('ERROR: ' + (err.reason || err.message));
  }
}

// ==================== CREATE GUILD ====================
async function createGuild() {
  if (!signer) {
    alert('CONNECT WALLET FIRST');
    return;
  }
  
  const name = document.getElementById('guildName').value;
  const desc = document.getElementById('guildDesc').value;
  const isPublic = document.getElementById('guildPublic').checked;
  const statusEl = document.getElementById('guildStatus');
  
  if (!name) {
    alert('ENTER GUILD NAME');
    return;
  }
  
  statusEl.textContent = 'CREATING...';
  statusEl.className = 'status';
  
  try {
    const contract = new ethers.Contract(
      CONTRACT_ADDRESSES.guildRegistry,
      GUILD_REGISTRY_ABI,
      signer
    );
    
    const tx = await contract.createGuild(
      name,
      desc,
      [userAddress],   // initialAdmins (self)
      isPublic
    );
    
    statusEl.textContent = 'TRANSACTION SENT: ' + tx.hash.slice(0, 10) + '...';
    await tx.wait();
    
    statusEl.textContent = 'GUILD CREATED SUCCESSFULLY!';
    statusEl.className = 'status success';
    
    loadGuilds(); // Refresh guild list
  } catch (err) {
    statusEl.textContent = 'ERROR: ' + (err.reason || err.message);
    statusEl.className = 'status error';
  }
}

// ==================== LOAD GUILDS ====================
async function loadGuilds() {
  if (!provider) return;
  
  try {
    const contract = new ethers.Contract(
      CONTRACT_ADDRESSES.guildRegistry,
      GUILD_REGISTRY_ABI,
      provider  // Read-only: use provider (not signer)
    );
    
    const totalGuilds = await contract.totalGuilds();
    const listEl = document.getElementById('guildsList');
    
    if (totalGuilds == 0) {
      listEl.innerHTML = '<p style="color: #555; text-transform: uppercase; letter-spacing: 0.1em;">NO GUILDS YET. CREATE ONE ABOVE!</p>';
      return;
    }
    
    let html = '';
    for (let i = 0; i < totalGuilds; i++) {
      const guild = await contract.getGuild(i);
      const badgeClass = guild[4] ? 'public' : 'private';
      const badgeText = guild[4] ? 'PUBLIC' : 'PRIVATE';
      html += `
        <div class="card guild-card">
          <h4>${guild[0]}</h4>
          <p>${guild[1]}</p>
          <span class="badge ${badgeClass}">${badgeText}</span>
        </div>
      `;
    }
    listEl.innerHTML = html;
  } catch (err) {
    console.error('[HELWAVE] Error loading guilds:', err);
  }
}

// ==================== TREASURY ====================
async function loadTreasuryBalance() {
  if (!provider) return;
  
  try {
    const contract = new ethers.Contract(
      CONTRACT_ADDRESSES.treasury,
      TREASURY_ABI,
      provider  // Read-only
    );
    
    const balance = await contract.getBalance();
    document.getElementById('treasuryBalance').textContent = balance.toString();
  } catch (err) {
    document.getElementById('treasuryBalance').textContent = 'ERROR LOADING';
    console.error('[HELWAVE] Error loading balance:', err);
  }
}

async function submitTransaction() {
  if (!signer) {
    alert('CONNECT WALLET FIRST');
    return;
  }
  
  const to = document.getElementById('txTo').value;
  const value = document.getElementById('txValue').value;
  const statusEl = document.getElementById('txStatus');
  
  if (!to || !value) {
    alert('FILL IN ALL FIELDS');
    return;
  }
  
  statusEl.textContent = 'SUBMITTING...';
  statusEl.className = 'status';
  
  try {
    const contract = new ethers.Contract(
      CONTRACT_ADDRESSES.treasury,
      TREASURY_ABI,
      signer
    );
    
    const tx = await contract.submitTransaction(
      to,
      ethers.parseEther(value),  // Convert to wei
      "0x"                       // Empty data (simple transfer)
    );
    
    statusEl.textContent = 'TRANSACTION SUBMITTED: ' + tx.hash.slice(0, 10) + '...';
    await tx.wait();
    
    statusEl.textContent = 'TRANSACTION CONFIRMED!';
    statusEl.className = 'status success';
    
    loadTreasuryBalance(); // Refresh balance
  } catch (err) {
    statusEl.textContent = 'ERROR: ' + (err.reason || err.message);
    statusEl.className = 'status error';
  }
}

// ==================== UTILITY ====================
function copyText(text) {
  navigator.clipboard.writeText(text).then(() => {
    alert('ADDRESS COPIED: ' + text);
  });
}

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('connectBtn').onclick = connectWallet;
  showPage('home');
  
  console.log('[HELWAVE] Initialized');
  console.log('[HELWAVE] ethers version:', ethers.version);
});
