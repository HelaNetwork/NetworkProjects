# Deploy CorePayroll to HeLa Testnet

## 1. Get testnet HLUSD

1. Go to **https://testnet-faucet.helachain.com**
2. Connect wallet (MetaMask) and add HeLa Testnet:
   - Network: HeLa Testnet
   - RPC: `https://testnet-rpc.helachain.com`
   - Chain ID: `666888`
3. Claim free HLUSD (once per 24h)

## 2. Setup

```bash
cd deploy
npm install
```

Create `.env`:
```bash
cp .env.example .env
```

Edit `.env`:
```
PRIVATE_KEY=your_wallet_private_key
TAX_VAULT_ADDRESS=0xYourAddress
```

> **Tax vault** – Address that receives the 10% tax. For testing, use your own address.

## 3. Deploy

```bash
npm run deploy
```

## 4. Update Backend

Copy the printed `CONTRACT_ADDRESS` into `Backend/.env`:
```
CONTRACT_ADDRESS=0x...
TAX_VAULT_ADDRESS=0x...
```
