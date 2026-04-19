# Esports Exchange API Docs (Devnet)

## 1) Product Model

This app uses two market layers:

1. **Asset market** (`TEAM` and `LAND` assets) priced by bonding curve.
2. **Prediction market** (`TEAM_A` / `TEAM_B` positions) for match outcomes.

Prediction market is an **AMM/pool P2P model** (not orderbook). Users trade against a shared liquidity pool and curve state.

## 2) Base URL and Auth

- Base URL: `http://localhost:3000`
- Exchange routes: `/api/*`
- Legacy user profile routes: `/user/*`

### Token Matrix

- **No token required**
  - `GET /`
  - `POST /api/auth/wallet`
  - `POST /api/auth/admin`
  - `GET /api/teams`
  - `GET /api/assets`
  - `GET /api/assets/:assetId/owners`
  - `GET /api/matches`
  - `GET /api/markets`
  - `GET /api/markets/:marketId/audit`
  - `GET /api/debug/exchange-state`

- **User token required** (`Authorization: Bearer <user_jwt>`)
  - `/api/assets/*/prepare|confirm`
  - `/api/markets/*/prepare|confirm`

- **Admin token required** (`Authorization: Bearer <admin_jwt>`) OR `x-admin-key`
  - `/api/admin/*`

## 3) Config Knobs (Devnet)

- `PLATFORM_FEE_BPS` (default `100` = 1.00%, max 200)
- `SOL_PER_USDC` (default `0.0001`) - conversion rate used to settle quote amounts in devnet SOL
- `AUTH_SIGN_MESSAGE`
- `ADMIN_WALLETS`

### Volatility Presets

- `LOW` -> `kFactor = 0.01`
- `MEDIUM` -> `kFactor = 0.05`
- `HIGH` -> `kFactor = 0.1`

Admin can pass either explicit `kFactor`/`bondingCurveK` or `volatilityPreset`.

---

## 4) Happy Path Demo Script (Admin -> User -> Result -> Claim)

### Step A1: Admin sign-in

`POST /api/auth/admin`

Request:

```json
{
  "walletAddress": "9FcnPPxpWC4u3tXPQRx3Bg5kPNVgXhXKoyBeqmF1PRMK",
  "signature": "<base64 signature of AUTH_SIGN_MESSAGE>"
}
```

Response:

```json
{
  "message": "Admin authenticated",
  "token": "<admin_jwt>",
  "isAdmin": true,
  "user": {
    "id": "cm_admin_1",
    "walletAddress": "9FcnPPxpWC4u3tXPQRx3Bg5kPNVgXhXKoyBeqmF1PRMK",
    "username": null
  }
}
```

### Step A2: Create two teams

`POST /api/admin/teams`

Request:

```json
{
  "name": "Team Alpha",
  "game": "Dota 2",
  "region": "EU",
  "logoUrl": "https://cdn.example.com/team-alpha.png"
}
```

Response:

```json
{
  "message": "Team created",
  "team": {
    "id": "cm_team_a",
    "name": "Team Alpha",
    "game": "Dota 2",
    "region": "EU"
  }
}
```

### Step A3: (Optional) Create collection

`POST /api/admin/collections`

Request:

```json
{
  "name": "Dota Season 1",
  "description": "Season bucket",
  "collectionMint": "<optional mint>",
  "metadataUri": "<optional uri>"
}
```

Response:

```json
{
  "message": "Collection created",
  "collection": {
    "id": "cm8collection123",
    "name": "Dota Season 1",
    "description": "Season bucket",
    "collectionMint": null,
    "metadataUri": "https://ik.imagekit.io/demo/collections/dota-season-1.json",
    "createdAt": "2026-03-13T10:12:00.000Z"
  },
  "metadataSource": "generated"
}
```

`metadataSource` is `"provided"` when you pass a URI, `"generated"` when the backend auto-uploads via ImageKit, `"none"` if both are absent.

### Step A4: Mint team asset

`POST /api/admin/assets/mint`

Request (all common fields):

```json
{
  "name": "Team Alpha Token",
  "teamId": "cm_team_a",
  "collectionId": "cm_collection_1",
  "totalSupply": 1000,
  "basePrice": 10,
  "kFactor": 0.05,
  "bondingCurveK": 0.05,
  "volatilityPreset": "MEDIUM"
}
```

### Step A5: Mint LAND NFT-style asset

`POST /api/admin/assets/mint/land`

Request:

```json
{
  "name": "Arena Parcel A1",
  "description": "Premium arena land",
  "location": "Sector-7",
  "collectionId": "cm_collection_1",
  "totalSupply": 1,
  "basePrice": 50,
  "volatilityPreset": "LOW",
  "imageBase64": "<optional base64 image>",
  "metadataUri": "<optional uri override>"
}
```

Response:

```json
{
  "message": "LAND asset minted",
  "asset": {
    "id": "cm_land_1",
    "assetType": "LAND"
  },
  "pricingConfig": {
    "basePrice": 50,
    "kFactor": 0.01,
    "volatilityPreset": "LOW"
  },
  "metadataSource": "generated",
  "mint": {
    "mintAddress": "...",
    "treasuryPda": "...",
    "txSignature": "..."
  }
}
```

### Step A6: Create match

`POST /api/admin/matches`

Request:

```json
{
  "teamAId": "cm_team_a",
  "teamBId": "cm_team_b",
  "tournament": "Spring Cup",
  "startTime": "2026-04-05T12:00:00.000Z"
}
```

### Step A7: Create market (AMM pool)

`POST /api/admin/markets`

Request:

```json
{
  "matchId": "cm_match_1",
  "basePrice": 1,
  "kFactor": 0.05,
  "volatilityPreset": "MEDIUM",
  "initialLiquidity": 2000
}
```

Response includes:

```json
{
  "message": "Market created",
  "marketModel": "AMM_POOL",
  "pricingConfig": {
    "basePrice": 1,
    "kFactor": 0.05,
    "volatilityPreset": "MEDIUM"
  }
}
```

### Step U1: User sign-in

`POST /api/auth/wallet`

Request:

```json
{
  "walletAddress": "<user wallet>",
  "signature": "<base64 signature of AUTH_SIGN_MESSAGE>"
}
```

### Step U2: User reads public market data

- `GET /api/matches`
- `GET /api/markets`
- `GET /api/markets/:marketId/audit`

### Step U3: User buys prediction side

1) `POST /api/markets/buy/prepare`

Request:

```json
{
  "marketId": "cm_market_1",
  "side": "TEAM_A",
  "quantity": 3
}
```

Prepare response includes:

```json
{
  "unsignedTx": "<base64 tx>",
  "preview": {
    "baseCost": 3.1,
    "totalCost": 3.131,
    "feeBreakdown": {
      "feeBps": 100,
      "feeAmount": 0.031
    }
  }
}
```

2) Wallet signs + broadcasts tx.

3) `POST /api/markets/buy/confirm`

```json
{
  "txSignature": "<solana signature>",
  "marketId": "cm_market_1",
  "side": "TEAM_A",
  "quantity": 3
}
```

### Step A8: Admin sets result

`POST /api/admin/matches/result`

Request:

```json
{
  "matchId": "cm_match_1",
  "winner": "TEAM_A"
}
```

### Step U4: Winner claims payout

1) `POST /api/markets/claim/prepare`

```json
{
  "marketId": "cm_market_1"
}
```

Prepare response includes gross/net + fee breakdown.

2) Wallet signs + broadcasts tx.

3) `POST /api/markets/claim/confirm`

```json
{
  "txSignature": "<solana signature>",
  "marketId": "cm_market_1"
}
```

Confirm response includes fee breakdown and recorded claim transaction:

```json
{
  "message": "Rewards claimed",
  "payout": 98,
  "feeBreakdown": {
    "feeBps": 100,
    "feeAmount": 1,
    "grossPayout": 99,
    "netPayout": 98
  },
  "transaction": {
    "txType": "CLAIM_REWARD"
  }
}
```

---

## 5) Endpoint Reference (Ordered)

### Admin setup endpoints

- `POST /api/auth/admin`
- `POST /api/admin/teams`
- `POST /api/admin/collections`
- `POST /api/admin/assets/mint`
- `POST /api/admin/assets/mint/land`
- `POST /api/admin/matches`
- `POST /api/admin/markets`
- `POST /api/admin/markets/liquidity`
- `POST /api/admin/matches/result`

### User trading endpoints (prepare/confirm)

- `POST /api/assets/buy/prepare`
- `POST /api/assets/buy/confirm`
- `POST /api/assets/sell/prepare`
- `POST /api/assets/sell/confirm`
- `POST /api/markets/buy/prepare`
- `POST /api/markets/buy/confirm`
- `POST /api/markets/sell/prepare`
- `POST /api/markets/sell/confirm`
- `POST /api/markets/claim/prepare`
- `POST /api/markets/claim/confirm`

### Transparency and audit endpoints

- `GET /api/assets/:assetId/owners`
- `GET /api/markets/:marketId/audit`
- `GET /api/admin/assets/:assetId/transactions`
- `GET /api/admin/assets/:assetId/holders`
- `GET /api/admin/transactions?txType=BUY_ASSET`

### User portfolio endpoints (user token required)

- `GET /api/user/portfolio`
- `GET /api/user/positions`
- `GET /api/user/transactions`

### Public read endpoints

- `GET /api/teams`
- `GET /api/assets`
- `GET /api/matches`
- `GET /api/markets`
- `GET /api/debug/exchange-state`

---

## 6) Fee and Transparency Behavior

- Platform fee is applied in prepare/confirm responses as `feeBreakdown`.
- Buys return `baseCost` + fee -> `totalCost`.
- Sells/claims return `grossPayout` - fee -> `netPayout`.
- Market audit endpoint exposes pool state, side supply, and recent trades for transparency.

---

## 7) Common Error Responses

```json
{ "message": "Unauthorized" }
```

```json
{ "message": "Admin access required" }
```

```json
{ "message": "Transaction memo does not match request parameters" }
```

```json
{ "message": "Market is not open" }
```

```json
{ "message": "No winning position to claim" }
```

## Exchange Auth Endpoint

### POST /api/auth/wallet

Authenticates a wallet for the exchange flow and returns a JWT.

Headers:

```http
Content-Type: application/json
```

Request body example with all accepted input concepts:

```json
{
  "walletAddress": "9xQeWvG816bUx9EPjHmaT23yvVMR9hM1S9h8y5RzV5j",
  "signature": "MEUCIQDbExampleBase64SignatureStringThatDecodesTo64Bytes=="
}
```

Notes:

- `walletAddress` must be a valid Solana public key string
- `signature` can be passed as a base64 string or another 64-byte-compatible shape accepted by the backend
- The signed message is `AUTH_SIGN_MESSAGE` env var or the default `Sign into mechanical turks`

Success response example:

```json
{
  "message": "existing",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example.token",
  "user": {
    "id": "cm8user123",
    "walletAddress": "9xQeWvG816bUx9EPjHmaT23yvVMR9hM1S9h8y5RzV5j",
    "username": "alphafan"
  }
}
```

Possible error responses:

```json
{
  "message": "Invalid walletAddress"
}
```

```json
{
  "message": "Invalid signature format/size (expected 64 bytes)"
}
```

```json
{
  "message": "Incorrect signature"
}
```

### POST /api/auth/admin

Authenticates an admin wallet and returns a JWT with admin privileges. The wallet must be listed in the `ADMIN_WALLETS` environment variable.

Headers:

```http
Content-Type: application/json
```

Request body:

```json
{
  "walletAddress": "9xQeWvG816bUx9EPjHmaT23yvVMR9hM1S9h8y5RzV5j",
  "signature": "MEUCIQDbExampleBase64SignatureStringThatDecodesTo64Bytes=="
}
```

Notes:

- Uses the same signature verification as `/api/auth/wallet`
- Returns `403` immediately if wallet is not in `ADMIN_WALLETS`
- Issued JWT contains `{ userId, isAdmin: true }` payload

Success response:

```json
{
  "message": "Admin authenticated",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example.token",
  "isAdmin": true,
  "user": {
    "id": "cm8user123",
    "walletAddress": "9xQeWvG816bUx9EPjHmaT23yvVMR9hM1S9h8y5RzV5j",
    "username": "adminuser"
  }
}
```

Possible error responses:

```json
{ "message": "Invalid walletAddress" }
```

```json
{ "message": "Invalid signature format/size (expected 64 bytes)" }
```

```json
{ "message": "Incorrect signature" }
```

```json
{ "message": "Wallet is not an admin" }
```

## Admin Endpoints

### POST /api/admin/teams

Creates a team.

Headers:

```http
Content-Type: application/json
Authorization: Bearer <jwt>
x-admin-key: <ADMIN_API_KEY>
```

Request body example with all supported fields:

```json
{
  "name": "Team Spirit",
  "game": "Dota 2",
  "region": "EU",
  "logoUrl": "https://cdn.example.com/teams/team-spirit.png"
}
```

Success response:

```json
{
  "message": "Team created",
  "team": {
    "id": "cm8team123",
    "name": "Team Spirit",
    "game": "Dota 2",
    "region": "EU",
    "logoUrl": "https://cdn.example.com/teams/team-spirit.png",
    "createdAt": "2026-03-13T10:10:00.000Z"
  }
}
```

### POST /api/admin/collections

Creates an asset collection. If `metadataUri` is omitted the backend auto-generates a JSON metadata file and uploads it via ImageKit.

Request body example with all supported fields:

```json
{
  "name": "Blue Chip Teams",
  "description": "Top esports teams collection",
  "collectionMint": "5FcollectionMint1111111111111111111111111111",
  "metadataUri": "https://ik.imagekit.io/demo/collections/blue-chip.json"
}
```

Success response:

```json
{
  "message": "Collection created",
  "collection": {
    "id": "cm8collection123",
    "name": "Blue Chip Teams",
    "description": "Top esports teams collection",
    "collectionMint": "5FcollectionMint1111111111111111111111111111",
    "metadataUri": "https://ik.imagekit.io/demo/collections/blue-chip.json",
    "createdAt": "2026-03-13T10:12:00.000Z"
  },
  "metadataSource": "provided"
}
```

`metadataSource` is `"provided"` when you pass a URI, `"generated"` when the backend auto-uploads via ImageKit, `"none"` if both are absent.

### POST /api/admin/assets/mint

Creates and mints a team asset.

Request body example with all supported fields:

```json
{
  "name": "Team Spirit Alpha",
  "teamId": "cm8team123",
  "collectionId": "cm8collection123",
  "totalSupply": 1000,
  "basePrice": 5,
  "kFactor": 0.1
}
```

Success response:

```json
{
  "message": "Asset minted",
  "asset": {
    "id": "cm8asset123",
    "name": "Team Spirit Alpha",
    "assetType": "TEAM",
    "teamId": "cm8team123",
    "collectionId": "cm8collection123",
    "mintAddress": "8Mint1111111111111111111111111111111111111",
    "metadataUri": "https://ik.imagekit.io/demo/assets/team-spirit-alpha.json",
    "basePrice": 5,
    "currentPrice": 5,
    "totalSupply": 1000,
    "circulating": 0,
    "bondingCurveK": 0.05,
    "createdAt": "2026-03-13T10:15:00.000Z"
  },
  "pricingConfig": {
    "basePrice": 5,
    "kFactor": 0.05,
    "volatilityPreset": "MEDIUM"
  },
  "mint": {
    "mintAddress": "8Mint1111111111111111111111111111111111111",
    "treasuryPda": "ATATreasury11111111111111111111111111111111",
    "txSignature": "4mintTx11111111111111111111111111111111111"
  }
}
```

### POST /api/admin/matches

Creates a match between two teams.

Request body example with all supported fields:

```json
{
  "teamAId": "cm8team123",
  "teamBId": "cm8team456",
  "tournament": "DreamLeague Season 25",
  "startTime": "2026-03-20T16:00:00.000Z"
}
```

Success response:

```json
{
  "message": "Match created",
  "match": {
    "id": "cm8match123",
    "teamAId": "cm8team123",
    "teamBId": "cm8team456",
    "tournament": "DreamLeague Season 25",
    "startTime": "2026-03-20T16:00:00.000Z",
    "status": "SCHEDULED",
    "result": null,
    "createdAt": "2026-03-13T10:20:00.000Z",
    "teamA": {
      "id": "cm8team123",
      "name": "Team Spirit",
      "game": "Dota 2",
      "region": "EU",
      "logoUrl": "https://cdn.example.com/teams/team-spirit.png",
      "createdAt": "2026-03-13T10:10:00.000Z"
    },
    "teamB": {
      "id": "cm8team456",
      "name": "Falcons",
      "game": "Dota 2",
      "region": "MENA",
      "logoUrl": "https://cdn.example.com/teams/falcons.png",
      "createdAt": "2026-03-13T10:11:00.000Z"
    }
  }
}
```

### POST /api/admin/markets

Creates a prediction market for a match.

Request body example with all supported fields:

```json
{
  "matchId": "cm8match123",
  "basePrice": 1,
  "kFactor": 0.05,
  "initialLiquidity": 1000
}
```

Success response:

```json
{
  "message": "Market created",
  "contractCall": {
    "method": "create_market",
    "txSignature": "5marketCreate111111111111111111111111111111"
  },
  "market": {
    "id": "cm8market123",
    "matchId": "cm8match123",
    "contractAddr": "5marketCreate111111111111111111111111111111",
    "liquidityPool": 1000,
    "supplyA": 0,
    "supplyB": 0,
    "basePrice": 1,
    "curveK": 0.05,
    "status": "OPEN",
    "createdAt": "2026-03-13T10:25:00.000Z",
    "match": {
      "id": "cm8match123",
      "teamAId": "cm8team123",
      "teamBId": "cm8team456",
      "tournament": "DreamLeague Season 25",
      "startTime": "2026-03-20T16:00:00.000Z",
      "status": "SCHEDULED",
      "result": null,
      "createdAt": "2026-03-13T10:20:00.000Z",
      "teamA": {
        "id": "cm8team123",
        "name": "Team Spirit",
        "game": "Dota 2",
        "region": "EU",
        "logoUrl": "https://cdn.example.com/teams/team-spirit.png",
        "createdAt": "2026-03-13T10:10:00.000Z"
      },
      "teamB": {
        "id": "cm8team456",
        "name": "Falcons",
        "game": "Dota 2",
        "region": "MENA",
        "logoUrl": "https://cdn.example.com/teams/falcons.png",
        "createdAt": "2026-03-13T10:11:00.000Z"
      }
    }
  }
}
```

### POST /api/admin/markets/liquidity

Adds liquidity to an existing prediction market.

Request body example with all supported fields:

```json
{
  "marketId": "cm8market123",
  "amount": 500
}
```

Success response:

```json
{
  "message": "Liquidity added",
  "contractCall": {
    "method": "add_liquidity",
    "txSignature": "6liquidityTx1111111111111111111111111111111"
  },
  "market": {
    "id": "cm8market123",
    "matchId": "cm8match123",
    "contractAddr": "5marketCreate111111111111111111111111111111",
    "liquidityPool": 1500,
    "supplyA": 0,
    "supplyB": 0,
    "basePrice": 1,
    "curveK": 0.05,
    "status": "OPEN",
    "createdAt": "2026-03-13T10:25:00.000Z"
  }
}
```

### POST /api/admin/matches/result

Sets the winning side and settles linked market(s).

Request body example with all supported fields:

```json
{
  "matchId": "cm8match123",
  "winner": "TEAM_A"
}
```

Success response:

```json
{
  "message": "Match result set",
  "contractCall": {
    "method": "set_result",
    "txSignature": "7resultTx111111111111111111111111111111111"
  },
  "match": {
    "id": "cm8match123",
    "teamAId": "cm8team123",
    "teamBId": "cm8team456",
    "tournament": "DreamLeague Season 25",
    "startTime": "2026-03-20T16:00:00.000Z",
    "status": "FINISHED",
    "result": "TEAM_A",
    "createdAt": "2026-03-13T10:20:00.000Z"
  }
}
```

## Public Read Endpoints

### GET /api/teams

Fetches all teams.

Success response:

```json
{
  "message": "Teams fetched",
  "data": [
    {
      "id": "cm8team123",
      "name": "Team Spirit",
      "game": "Dota 2",
      "region": "EU",
      "logoUrl": "https://cdn.example.com/teams/team-spirit.png",
      "createdAt": "2026-03-13T10:10:00.000Z"
    },
    {
      "id": "cm8team456",
      "name": "Falcons",
      "game": "Dota 2",
      "region": "MENA",
      "logoUrl": "https://cdn.example.com/teams/falcons.png",
      "createdAt": "2026-03-13T10:11:00.000Z"
    }
  ]
}
```

### GET /api/assets

Fetches all minted assets. The backend recalculates `currentPrice` from the bonding curve before returning the response.

Success response:

```json
{
  "message": "Assets fetched",
  "data": [
    {
      "id": "cm8asset123",
      "name": "Team Spirit Alpha",
      "assetType": "TEAM",
      "teamId": "cm8team123",
      "collectionId": "cm8collection123",
      "mintAddress": "8Mint1111111111111111111111111111111111111",
      "metadataUri": "https://ik.imagekit.io/demo/assets/team-spirit-alpha.json",
      "basePrice": 5,
      "currentPrice": 5.4,
      "totalSupply": 1000,
      "circulating": 4,
      "bondingCurveK": 0.1,
      "createdAt": "2026-03-13T10:15:00.000Z",
      "team": {
        "id": "cm8team123",
        "name": "Team Spirit",
        "game": "Dota 2",
        "region": "EU",
        "logoUrl": "https://cdn.example.com/teams/team-spirit.png",
        "createdAt": "2026-03-13T10:10:00.000Z"
      },
      "collection": {
        "id": "cm8collection123",
        "name": "Blue Chip Teams",
        "description": "Top esports teams collection",
        "collectionMint": "5FcollectionMint1111111111111111111111111111",
        "metadataUri": "https://ik.imagekit.io/demo/collections/blue-chip.json",
        "createdAt": "2026-03-13T10:12:00.000Z"
      }
    }
  ]
}
```

### GET /api/matches

Fetches all matches ordered by start time.

Success response:

```json
{
  "message": "Matches fetched",
  "data": [
    {
      "id": "cm8match123",
      "teamAId": "cm8team123",
      "teamBId": "cm8team456",
      "tournament": "DreamLeague Season 25",
      "startTime": "2026-03-20T16:00:00.000Z",
      "status": "SCHEDULED",
      "result": null,
      "createdAt": "2026-03-13T10:20:00.000Z",
      "teamA": {
        "id": "cm8team123",
        "name": "Team Spirit",
        "game": "Dota 2",
        "region": "EU",
        "logoUrl": "https://cdn.example.com/teams/team-spirit.png",
        "createdAt": "2026-03-13T10:10:00.000Z"
      },
      "teamB": {
        "id": "cm8team456",
        "name": "Falcons",
        "game": "Dota 2",
        "region": "MENA",
        "logoUrl": "https://cdn.example.com/teams/falcons.png",
        "createdAt": "2026-03-13T10:11:00.000Z"
      }
    }
  ]
}
```

### GET /api/markets

Fetches all prediction markets. The backend adds derived `teamAPrice` and `teamBPrice` values.

Success response:

```json
{
  "message": "Markets fetched",
  "data": [
    {
      "id": "cm8market123",
      "matchId": "cm8match123",
      "contractAddr": "5marketCreate111111111111111111111111111111",
      "liquidityPool": 1500,
      "supplyA": 10,
      "supplyB": 8,
      "basePrice": 1,
      "curveK": 0.05,
      "status": "OPEN",
      "createdAt": "2026-03-13T10:25:00.000Z",
      "match": {
        "id": "cm8match123",
        "teamAId": "cm8team123",
        "teamBId": "cm8team456",
        "tournament": "DreamLeague Season 25",
        "startTime": "2026-03-20T16:00:00.000Z",
        "status": "SCHEDULED",
        "result": null,
        "createdAt": "2026-03-13T10:20:00.000Z",
        "teamA": {
          "id": "cm8team123",
          "name": "Team Spirit",
          "game": "Dota 2",
          "region": "EU",
          "logoUrl": "https://cdn.example.com/teams/team-spirit.png",
          "createdAt": "2026-03-13T10:10:00.000Z"
        },
        "teamB": {
          "id": "cm8team456",
          "name": "Falcons",
          "game": "Dota 2",
          "region": "MENA",
          "logoUrl": "https://cdn.example.com/teams/falcons.png",
          "createdAt": "2026-03-13T10:11:00.000Z"
        }
      },
      "teamAPrice": 1.5,
      "teamBPrice": 1.4
    }
  ]
}
```

### GET /api/debug/exchange-state

Returns record counts for quick debugging.

Success response:

```json
{
  "teams": 2,
  "assets": 1,
  "matches": 1,
  "markets": 1
}
```

## Asset Trading Endpoints

### POST /api/assets/buy/prepare

Builds an unsigned devnet transaction for buying an asset.

Request body example with all supported fields:

```json
{
  "assetId": "cm8asset123",
  "quantity": 2
}
```

Success response:

```json
{
  "unsignedTx": "AQABAgMExampleBase64SerializedTransactionForPhantomSign",
  "preview": {
    "assetId": "cm8asset123",
    "assetName": "Team Spirit Alpha",
    "quantity": 2,
    "baseCost": 10.0,
    "totalCost": 10.1,
    "feeBreakdown": {
      "feeBps": 100,
      "feeAmount": 0.1
    },
    "currentPrice": 5.0
  }
}
```

Sign `unsignedTx` with the user wallet (Phantom / wallet adapter), broadcast it, then call `/confirm` with the returned signature.

### POST /api/assets/buy/confirm

Verifies the signed transaction and persists the buy.

Request body example with all supported fields:

```json
{
  "txSignature": "3buyConfirm111111111111111111111111111111111",
  "assetId": "cm8asset123",
  "quantity": 2
}
```

Success response:

```json
{
  "message": "Asset buy confirmed",
  "asset": {
    "id": "cm8asset123",
    "name": "Team Spirit Alpha",
    "assetType": "TEAM",
    "teamId": "cm8team123",
    "collectionId": "cm8collection123",
    "mintAddress": "8Mint1111111111111111111111111111111111111",
    "metadataUri": "https://ik.imagekit.io/demo/assets/team-spirit-alpha.json",
    "basePrice": 5,
    "currentPrice": 5.6,
    "totalSupply": 1000,
    "circulating": 6,
    "bondingCurveK": 0.1,
    "createdAt": "2026-03-13T10:15:00.000Z"
  },
  "quantity": 2,
  "totalCost": 10.1,
  "feeBreakdown": {
    "feeBps": 100,
    "feeAmount": 0.1,
    "baseCost": 10.0
  },
  "transaction": {
    "id": "cm8tx123",
    "userId": "cm8user123",
    "txType": "BUY_ASSET",
    "assetId": "cm8asset123",
    "marketId": null,
    "quantity": 2,
    "amountUsdc": 10.1,
    "txSignature": "3buyConfirm111111111111111111111111111111111",
    "createdAt": "2026-03-13T10:30:00.000Z"
  }
}
```

### POST /api/assets/sell/prepare

Builds an unsigned devnet transaction for selling an asset.

Request body example with all supported fields:

```json
{
  "assetId": "cm8asset123",
  "quantity": 1
}
```

Success response:

```json
{
  "unsignedTx": "AQABAgMExampleBase64SerializedSellTransaction",
  "preview": {
    "assetId": "cm8asset123",
    "assetName": "Team Spirit Alpha",
    "quantity": 1,
    "grossPayout": 5.5,
    "netPayout": 5.445,
    "feeBreakdown": {
      "feeBps": 100,
      "feeAmount": 0.055
    },
    "currentPrice": 5.5
  }
}
```

### POST /api/assets/sell/confirm

Verifies the signed transaction and persists the sell.

Request body example with all supported fields:

```json
{
  "txSignature": "3sellConfirm11111111111111111111111111111111",
  "assetId": "cm8asset123",
  "quantity": 1
}
```

Success response:

```json
{
  "message": "Asset sell confirmed",
  "asset": {
    "id": "cm8asset123",
    "name": "Team Spirit Alpha",
    "assetType": "TEAM",
    "teamId": "cm8team123",
    "collectionId": "cm8collection123",
    "mintAddress": "8Mint1111111111111111111111111111111111111",
    "metadataUri": "https://ik.imagekit.io/demo/assets/team-spirit-alpha.json",
    "basePrice": 5,
    "currentPrice": 5.5,
    "totalSupply": 1000,
    "circulating": 5,
    "bondingCurveK": 0.1,
    "createdAt": "2026-03-13T10:15:00.000Z"
  },
  "quantity": 1,
  "totalPayout": 5.445,
  "feeBreakdown": {
    "feeBps": 100,
    "feeAmount": 0.055,
    "grossPayout": 5.5,
    "netPayout": 5.445
  },
  "transaction": {
    "id": "cm8tx124",
    "userId": "cm8user123",
    "txType": "SELL_ASSET",
    "assetId": "cm8asset123",
    "marketId": null,
    "quantity": 1,
    "amountUsdc": 5.445,
    "txSignature": "3sellConfirm11111111111111111111111111111111",
    "createdAt": "2026-03-13T10:35:00.000Z"
  }
}
```

## Prediction Market Trading Endpoints

### POST /api/markets/buy/prepare

Builds an unsigned transaction for buying a prediction position.

Request body example with all supported fields:

```json
{
  "marketId": "cm8market123",
  "side": "TEAM_A",
  "quantity": 5
}
```

Success response:

```json
{
  "unsignedTx": "AQABAgMExampleBase64PredictionBuyTransaction",
  "preview": {
    "marketId": "cm8market123",
    "side": "TEAM_A",
    "quantity": 5,
    "baseCost": 6.25,
    "totalCost": 6.3125,
    "feeBreakdown": {
      "feeBps": 100,
      "feeAmount": 0.0625
    },
    "teamAName": "Team Spirit",
    "teamBName": "Falcons"
  }
}
```

`side` must be exactly `"TEAM_A"` or `"TEAM_B"`. Sign and broadcast, then call `/confirm`.

### POST /api/markets/buy/confirm

Verifies the signed transaction and persists the position buy.

Request body example with all supported fields:

```json
{
  "txSignature": "4predictionBuy111111111111111111111111111111",
  "marketId": "cm8market123",
  "side": "TEAM_A",
  "quantity": 5
}
```

Success response:

```json
{
  "message": "Prediction buy confirmed",
  "market": {
    "id": "cm8market123",
    "matchId": "cm8match123",
    "contractAddr": "5marketCreate111111111111111111111111111111",
    "liquidityPool": 1506.25,
    "supplyA": 15,
    "supplyB": 8,
    "basePrice": 1,
    "curveK": 0.05,
    "status": "OPEN",
    "createdAt": "2026-03-13T10:25:00.000Z"
  },
  "quantity": 5,
  "totalCost": 6.3125,
  "feeBreakdown": {
    "feeBps": 100,
    "feeAmount": 0.0625,
    "baseCost": 6.25
  },
  "transaction": {
    "id": "cm8tx125",
    "userId": "cm8user123",
    "txType": "BUY_PREDICTION",
    "assetId": null,
    "marketId": "cm8market123",
    "quantity": 5,
    "amountUsdc": 6.3125,
    "txSignature": "4predictionBuy111111111111111111111111111111",
    "createdAt": "2026-03-13T10:40:00.000Z"
  }
}
```

### POST /api/markets/sell/prepare

Builds an unsigned transaction for selling a prediction position.

Request body example with all supported fields:

```json
{
  "marketId": "cm8market123",
  "side": "TEAM_A",
  "quantity": 2
}
```

Success response:

```json
{
  "unsignedTx": "AQABAgMExampleBase64PredictionSellTransaction",
  "preview": {
    "marketId": "cm8market123",
    "side": "TEAM_A",
    "quantity": 2,
    "grossPayout": 2.85,
    "netPayout": 2.8215,
    "feeBreakdown": {
      "feeBps": 100,
      "feeAmount": 0.0285
    },
    "teamAName": "Team Spirit",
    "teamBName": "Falcons"
  }
}
```

### POST /api/markets/sell/confirm

Verifies the signed transaction and persists the position sell.

Request body example with all supported fields:

```json
{
  "txSignature": "4predictionSell11111111111111111111111111111",
  "marketId": "cm8market123",
  "side": "TEAM_A",
  "quantity": 2
}
```

Success response:

```json
{
  "message": "Prediction sell confirmed",
  "market": {
    "id": "cm8market123",
    "matchId": "cm8match123",
    "contractAddr": "5marketCreate111111111111111111111111111111",
    "liquidityPool": 1503.4,
    "supplyA": 13,
    "supplyB": 8,
    "basePrice": 1,
    "curveK": 0.05,
    "status": "OPEN",
    "createdAt": "2026-03-13T10:25:00.000Z"
  },
  "quantity": 2,
  "totalPayout": 2.8215,
  "feeBreakdown": {
    "feeBps": 100,
    "feeAmount": 0.0285,
    "grossPayout": 2.85,
    "netPayout": 2.8215
  },
  "transaction": {
    "id": "cm8tx126",
    "userId": "cm8user123",
    "txType": "SELL_PREDICTION",
    "assetId": null,
    "marketId": "cm8market123",
    "quantity": 2,
    "amountUsdc": 2.8215,
    "txSignature": "4predictionSell11111111111111111111111111111",
    "createdAt": "2026-03-13T10:45:00.000Z"
  }
}
```

### POST /api/markets/claim/prepare

Builds an unsigned transaction for reward claim after market settlement.

Request body example with all supported fields:

```json
{
  "marketId": "cm8market123"
}
```

Success response:

```json
{
  "unsignedTx": "AQABAgMExampleBase64ClaimTransaction",
  "preview": {
    "marketId": "cm8market123",
    "winningSide": "TEAM_A",
    "winningAmount": 12,
    "grossPayout": 45.07,
    "netPayout": 44.62,
    "feeBreakdown": {
      "feeBps": 100,
      "feeAmount": 0.45
    },
    "teamAName": "Team Spirit",
    "teamBName": "Falcons"
  }
}
```

### POST /api/markets/claim/confirm

Verifies the signed transaction and persists the reward claim.

Request body example with all supported fields:

```json
{
  "txSignature": "4claim111111111111111111111111111111111111",
  "marketId": "cm8market123"
}
```

Success response:

```json
{
  "message": "Rewards claimed",
  "payout": 44.6,
  "feeBreakdown": {
    "feeBps": 100,
    "feeAmount": 0.45,
    "grossPayout": 45.05,
    "netPayout": 44.6
  },
  "transaction": {
    "id": "cm8tx127",
    "userId": "cm8user123",
    "txType": "CLAIM_REWARD",
    "assetId": null,
    "marketId": "cm8market123",
    "quantity": 12,
    "amountUsdc": 44.6,
    "txSignature": "4claim111111111111111111111111111111111111",
    "createdAt": "2026-03-13T10:50:00.000Z"
  }
}
```

## User Route Endpoints

These routes are mounted separately under `/user`.

### GET /user/by-wallet/:walletAddress

Looks up a user by wallet address.

Success response when found:

```json
{
  "exists": true,
  "user": {
    "id": "cm8user123",
    "walletAddress": "9xQeWvG816bUx9EPjHmaT23yvVMR9hM1S9h8y5RzV5j",
    "username": "alphafan",
    "avatarUrl": null,
    "country": "India",
    "bio": "Esports fan and trader",
    "createdAt": "2026-03-13T10:00:00.000Z"
  }
}
```

Success response when not found:

```json
{
  "exists": false,
  "message": "No user"
}
```

### POST /user/signin

Legacy user signin route. This route signs a fixed message and issues a JWT.

Request body example with all supported fields:

```json
{
  "publicKey": "9xQeWvG816bUx9EPjHmaT23yvVMR9hM1S9h8y5RzV5j",
  "signature": "MEUCIQDbExampleBase64SignatureStringThatDecodesTo64Bytes=="
}
```

Success response example for an existing user:

```json
{
  "message": "existing",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.legacy.user.token"
}
```

Success response example for a new user:

```json
{
  "message": "non-existing",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.legacy.new.user.token"
}
```

### PUT /user/profile

Updates editable user profile fields.

Headers:

```http
Authorization: Bearer <jwt>
Content-Type: application/json
```

Request body example with all supported fields:

```json
{
  "username": "alphafan",
  "country": "India"
}
```

Success response:

```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": "cm8user123",
    "walletAddress": "9xQeWvG816bUx9EPjHmaT23yvVMR9hM1S9h8y5RzV5j",
    "username": "alphafan",
    "avatarUrl": null,
    "country": "India",
    "bio": null,
    "createdAt": "2026-03-13T10:00:00.000Z"
  }
}
```

### GET /user/profile

Fetches the authenticated user's profile.

Headers:

```http
Authorization: Bearer <jwt>
```

Success response:

```json
{
  "message": "Profile fetched successfully",
  "user": {
    "id": "cm8user123",
    "walletAddress": "9xQeWvG816bUx9EPjHmaT23yvVMR9hM1S9h8y5RzV5j",
    "username": "alphafan",
    "avatarUrl": null,
    "country": "India",
    "bio": "Esports fan and trader",
    "createdAt": "2026-03-13T10:00:00.000Z"
  }
}
```

## Transparency and Audit Endpoints

### GET /api/assets/:assetId/owners

Public. Returns all current holders of an asset with their quantities and wallet addresses.

Success response:

```json
{
  "message": "Asset owners fetched",
  "asset": {
    "id": "cm8asset123",
    "name": "Team Spirit Alpha",
    "assetType": "TEAM",
    "circulating": 6,
    "totalSupply": 1000,
    "currentPrice": 5.6
  },
  "holdersCount": 2,
  "totalHeld": 6,
  "data": [
    {
      "id": "cm8ua1",
      "userId": "cm8user123",
      "assetId": "cm8asset123",
      "quantity": 4,
      "avgPrice": 5.05,
      "createdAt": "2026-03-13T10:30:00.000Z",
      "user": {
        "id": "cm8user123",
        "walletAddress": "9xQeWvG816bUx9EPjHmaT23yvVMR9hM1S9h8y5RzV5j",
        "username": "alphafan"
      }
    }
  ]
}
```

### GET /api/markets/:marketId/audit

Public transparency endpoint. Returns pool state, side supply, current prices, recent trades, and settlement info.

Success response:

```json
{
  "message": "Market audit fetched",
  "marketModel": "AMM_POOL_P2P",
  "feeModel": { "feeBps": 100 },
  "market": {
    "id": "cm8market123",
    "matchId": "cm8match123",
    "liquidityPool": 1503.4,
    "supplyA": 13,
    "supplyB": 8,
    "basePrice": 1,
    "curveK": 0.05,
    "status": "OPEN",
    "teamAPrice": 1.65,
    "teamBPrice": 1.4
  },
  "transparency": {
    "poolLiquidity": 1503.4,
    "supplyA": 13,
    "supplyB": 8,
    "recentTradesCount": 7
  },
  "settlement": null,
  "recentTrades": [
    {
      "id": "cm8tx125",
      "txType": "BUY_PREDICTION",
      "quantity": 5,
      "amountUsdc": 6.3125,
      "createdAt": "2026-03-13T10:40:00.000Z",
      "user": { "id": "cm8user123", "walletAddress": "9xQe...", "username": "alphafan" }
    }
  ]
}
```

## Admin Audit Endpoints

### GET /api/admin/assets/:assetId/transactions

Admin only. Returns all BUY_ASSET and SELL_ASSET transactions for a specific asset.

Headers: `Authorization: Bearer <admin_jwt>` or `x-admin-key: <ADMIN_API_KEY>`

Success response:

```json
{
  "message": "Asset transactions fetched",
  "asset": {
    "id": "cm8asset123",
    "name": "Team Spirit Alpha",
    "circulating": 6,
    "totalSupply": 1000,
    "currentPrice": 5.6
  },
  "count": 3,
  "data": [
    {
      "id": "cm8tx123",
      "txType": "BUY_ASSET",
      "quantity": 2,
      "amountUsdc": 10.1,
      "txSignature": "3buyConfirm111111111111111111111111111111111",
      "createdAt": "2026-03-13T10:30:00.000Z",
      "user": {
        "id": "cm8user123",
        "walletAddress": "9xQeWvG816bUx9EPjHmaT23yvVMR9hM1S9h8y5RzV5j",
        "username": "alphafan"
      }
    }
  ]
}
```

### GET /api/admin/assets/:assetId/holders

Admin only. Returns all current holders of an asset sorted by quantity descending.

Headers: `Authorization: Bearer <admin_jwt>` or `x-admin-key: <ADMIN_API_KEY>`

Success response:

```json
{
  "message": "Asset holders fetched",
  "asset": {
    "id": "cm8asset123",
    "name": "Team Spirit Alpha",
    "circulating": 6,
    "totalSupply": 1000,
    "currentPrice": 5.6
  },
  "holdersCount": 2,
  "totalHeld": 6,
  "data": [
    {
      "id": "cm8ua1",
      "quantity": 4,
      "avgPrice": 5.05,
      "createdAt": "2026-03-13T10:30:00.000Z",
      "user": {
        "id": "cm8user123",
        "walletAddress": "9xQeWvG816bUx9EPjHmaT23yvVMR9hM1S9h8y5RzV5j",
        "username": "alphafan"
      }
    }
  ]
}
```

### GET /api/admin/transactions

Admin only. Returns all platform transactions. Filter by type with `?txType=` query param.

Valid `txType` values: `BUY_ASSET`, `SELL_ASSET`, `BUY_PREDICTION`, `SELL_PREDICTION`, `CLAIM_REWARD`.

Headers: `Authorization: Bearer <admin_jwt>` or `x-admin-key: <ADMIN_API_KEY>`

Success response:

```json
{
  "message": "Transactions fetched",
  "filter": { "txType": "BUY_ASSET" },
  "count": 2,
  "data": [
    {
      "id": "cm8tx123",
      "userId": "cm8user123",
      "txType": "BUY_ASSET",
      "assetId": "cm8asset123",
      "marketId": null,
      "quantity": 2,
      "amountUsdc": 10.1,
      "txSignature": "3buyConfirm111111111111111111111111111111111",
      "createdAt": "2026-03-13T10:30:00.000Z",
      "user": {
        "id": "cm8user123",
        "walletAddress": "9xQeWvG816bUx9EPjHmaT23yvVMR9hM1S9h8y5RzV5j",
        "username": "alphafan"
      }
    }
  ]
}
```

## User Portfolio Endpoints

All three endpoints require `Authorization: Bearer <user_jwt>`.

### GET /api/user/portfolio

Returns all assets the user currently holds, with current price, value, and unrealized P&L per holding plus an overall summary.

Success response:

```json
{
  "message": "Portfolio fetched",
  "summary": {
    "totalHoldings": 2,
    "totalValue": 27.8,
    "totalCost": 22.0,
    "totalUnrealizedPnl": 5.8,
    "totalUnrealizedPnlPct": 26.36
  },
  "holdings": [
    {
      "holdingId": "cm8ua1",
      "asset": {
        "id": "cm8asset123",
        "name": "Team Spirit Alpha",
        "assetType": "TEAM",
        "mintAddress": "8Mint1111111111111111111111111111111111111",
        "metadataUri": "https://ik.imagekit.io/demo/assets/team-spirit-alpha.json",
        "team": { "id": "cm8team123", "name": "Team Spirit", "logoUrl": null },
        "collection": { "id": "cm8collection123", "name": "Blue Chip Teams" }
      },
      "quantity": 4,
      "avgBuyPrice": 5.05,
      "currentPrice": 5.6,
      "currentValue": 22.4,
      "costBasis": 20.2,
      "unrealizedPnl": 2.2,
      "unrealizedPnlPct": 10.89,
      "acquiredAt": "2026-03-13T10:30:00.000Z"
    }
  ]
}
```

### GET /api/user/positions

Returns all open prediction market positions the user holds, with current sell value and unrealized P&L.

Success response:

```json
{
  "message": "Positions fetched",
  "totalPositions": 1,
  "positions": [
    {
      "positionId": "cm8pos1",
      "market": {
        "id": "cm8market123",
        "status": "OPEN",
        "match": {
          "id": "cm8match123",
          "startTime": "2026-03-20T16:00:00.000Z",
          "result": null,
          "teamA": { "id": "cm8team123", "name": "Team Spirit", "logoUrl": null },
          "teamB": { "id": "cm8team456", "name": "Falcons", "logoUrl": null }
        }
      },
      "side": "TEAM_A",
      "amount": 5,
      "avgBuyPrice": 1.2625,
      "currentPrice": 1.65,
      "currentValue": 7.6,
      "costBasis": 6.3125,
      "unrealizedPnl": 1.29,
      "unrealizedPnlPct": 20.43,
      "openedAt": "2026-03-13T10:40:00.000Z"
    }
  ]
}
```

### GET /api/user/transactions

Returns the authenticated user's paginated transaction history.

Query params: `limit` (default 20, max 100), `offset` (default 0).

Example: `GET /api/user/transactions?limit=10&offset=0`

Success response:

```json
{
  "message": "Transactions fetched",
  "pagination": { "total": 5, "limit": 10, "offset": 0 },
  "transactions": [
    {
      "id": "cm8tx127",
      "userId": "cm8user123",
      "txType": "CLAIM_REWARD",
      "assetId": null,
      "marketId": "cm8market123",
      "quantity": 12,
      "amountUsdc": 44.62,
      "txSignature": "4claim111111111111111111111111111111111111",
      "createdAt": "2026-03-13T10:50:00.000Z"
    },
    {
      "id": "cm8tx123",
      "userId": "cm8user123",
      "txType": "BUY_ASSET",
      "assetId": "cm8asset123",
      "marketId": null,
      "quantity": 2,
      "amountUsdc": 10.1,
      "txSignature": "3buyConfirm111111111111111111111111111111111",
      "createdAt": "2026-03-13T10:30:00.000Z"
    }
  ]
}
```

## Error Behavior Notes

Common error responses:

- `401 Unauthorized` when JWT is missing or invalid
- `403 Admin access required` for protected admin routes
- `404` for missing resources such as team, asset, match, or market
- `400` for invalid request body data or a transaction/memo mismatch
- `500` for unexpected backend failures

Common validation rules enforced in code:

- `assetId`, `marketId`, `matchId`, `teamAId`, `teamBId`, `name`, and `game` must be non-empty strings where required
- `quantity` must be a positive integer
- `basePrice`, `kFactor`, `initialLiquidity`, and `amount` must be positive numbers
- prediction `side` must be `TEAM_A` or `TEAM_B`
- result `winner` must be `TEAM_A` or `TEAM_B`

## Environment Variables

Important environment variables used by this backend:

- `JWT_SECRET`
- `AUTH_SIGN_MESSAGE`
- `DATABASE_URL`
- `SOLANA_RPC_URL`
- `PLATFORM_SIGNER_SECRET`
- `USDC_MINT_ADDRESS`
- `USDC_DECIMALS`
- `ADMIN_API_KEY`
- `ADMIN_WALLETS`
- `ADMIN_MINT_WALLET`
- ImageKit-related variables required by metadata upload flow

### Devnet Funding Notes

- Devnet airdrop gives SOL, and this backend now settles trades in SOL only.
- Buy routes deduct SOL from the user wallet and send it to the platform treasury wallet.
- Sell and claim routes pay SOL from the platform treasury wallet back to the user wallet.
- Ensure treasury wallet (`PLATFORM_SIGNER_SECRET`) is pre-funded with enough devnet SOL for payouts.

## Product Behavior Summary

### Team Asset Market

- Assets use a bonding curve
- Buying increases `circulating` supply and raises price
- Selling decreases `circulating` supply and lowers price
- Asset token transfer is a real SPL token movement on devnet
- Asset buys also transfer devnet SOL from user wallet -> treasury wallet
- Asset sells transfer devnet SOL from treasury wallet -> user wallet

### Prediction Market

- Users buy positions on `TEAM_A` or `TEAM_B`
- Market supply and liquidity are updated in the database after `confirm`
- Settlement occurs when admin posts the result
- Reward claims are proportional to winning-side ownership
- Prediction buys transfer devnet SOL from user wallet -> treasury wallet
- Prediction sells and claims transfer devnet SOL from treasury wallet -> user wallet

### Idempotency

All `confirm` routes check for an existing `transaction` row with the same `txSignature` and `userId`.

That means repeated confirm calls for the same transaction will not duplicate state changes.
