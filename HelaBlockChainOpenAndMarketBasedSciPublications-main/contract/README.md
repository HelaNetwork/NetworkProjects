# ResearchVerify Smart Contract

## Files
- `ResearchVerify.sol` — contract source
- `ResearchVerify.abi.json` — ABI ready for PROMPT 3

---

## HeLa Testnet Details

| Field       | Value                                    |
|-------------|------------------------------------------|
| Network     | HeLa Official Runtime Testnet            |
| Chain ID    | `666888`                                 |
| RPC URL     | `https://testnet-rpc.helachain.com`      |
| Symbol      | `HLUSD`                                  |
| Explorer    | `https://testnet-blockexplorer.helachain.com` |
| Faucet      | `https://testnet-faucet.helachain.com`   |

> ⚠️ HeLa uses **HLUSD** (stablecoin) as gas — NOT HELA token. Get free 10 HLUSD/day from faucet.

---

## Deploy Steps (Remix — Fastest for Hackathon)

### Step 1 — Add HeLa Testnet to MetaMask
Open MetaMask → Networks → Add Network manually:
- Network Name: `HeLa Testnet`
- RPC URL: `https://testnet-rpc.helachain.com`
- Chain ID: `666888`
- Symbol: `HLUSD`
- Explorer: `https://testnet-blockexplorer.helachain.com`

### Step 2 — Get HLUSD from faucet
Go to: https://testnet-faucet.helachain.com
Connect wallet → Claim → Get 10 HLUSD

### Step 3 — Open Remix
Go to: https://remix.ethereum.org

### Step 4 — Paste contract
- Create new file: `ResearchVerify.sol`
- Paste the contract code
- **Important:** Compiler version must be `0.8.9` (HeLa requirement)

### Step 5 — Compile
- Go to **Solidity Compiler** tab
- Select version: `0.8.9`
- Click **Compile ResearchVerify.sol**

### Step 6 — Deploy
- Go to **Deploy & Run Transactions** tab
- Environment: **Injected Provider - MetaMask**
- Make sure MetaMask is on HeLa Testnet (Chain ID: 666888)
- Click **Deploy**
- Confirm in MetaMask (gas paid in HLUSD)

### Step 7 — Copy contract address
After deploy → copy the address from Remix
→ Paste into `frontend/next.config.js`:
```js
NEXT_PUBLIC_CONTRACT_ADDRESS: "0xYOUR_CONTRACT_ADDRESS"
```

---

## Contract Functions

| Function | Type | Description |
|----------|------|-------------|
| `addHash(string hash)` | write | Store hash + msg.sender |
| `getAllHashes()` | read | Return all PaperRecord[] |
| `getRecord(uint256 index)` | read | Single record by index |
| `totalRecords()` | read | Count of records |

---

## PaperRecord struct
```solidity
struct PaperRecord {
    string  hash;       // SHA256 from backend
    address uploader;   // wallet address
    uint256 timestamp;  // block.timestamp
}
```
