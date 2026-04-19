# Smart Contracts

## Included Programs

1. `asset-mint-program`
   - Create asset records for team/asset NFTs
   - Admin updates for price and metadata URI

2. `bonding-curve-market`
   - Initialize curve market
   - Buy/sell quotes
   - Supply updates through execute buy/sell

3. `prediction-market`
   - Initialize match market
   - Place bets by side
   - Resolve market and claim rewards

## Build with Docker

From `Backend/`:

```powershell
docker run --rm -v "${PWD}\contracts\asset-mint-program:/work" solanalabs/solana:v1.18.26 bash -lc "cd /work && cargo build-sbf"
docker run --rm -v "${PWD}\contracts\bonding-curve-market:/work" solanalabs/solana:v1.18.26 bash -lc "cd /work && cargo build-sbf"
docker run --rm -v "${PWD}\contracts\prediction-market:/work" solanalabs/solana:v1.18.26 bash -lc "cd /work && cargo build-sbf"
```

Artifacts are generated in each contract's `target/deploy` directory.

## Deploy to Devnet (PowerShell helpers)

From `Backend/`:

```powershell
npm run deploy:asset-mint:devnet
npm run deploy:bonding-curve:devnet
npm run deploy:prediction-market:devnet
```

Or deploy all three in order:

```powershell
npm run deploy:contracts:devnet
```

The deploy scripts update `.env` with:

- `ASSET_MINT_PROGRAM_ID`
- `BONDING_CURVE_PROGRAM_ID`
- `PREDICTION_MARKET_PROGRAM_ID`
