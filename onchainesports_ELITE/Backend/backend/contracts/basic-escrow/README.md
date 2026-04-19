# basic-escrow

Minimal Solana program for hackathon deployment proof.

## Deploy with Docker (no local Rust needed)

From `Backend/` run:

```powershell
npm run deploy:escrow:devnet
```

What it does:
1. Builds this program in Docker.
2. Airdrops devnet SOL to your local deploy wallet if needed.
3. Deploys program to devnet.
4. Updates `ESCROW_PROGRAM_ID` in `.env`.

After deploy, restart backend and verify:

```http
GET /api/escrow/program-status?propertyId=demo_property
```

Expected fields:
- `escrowProgramId`
- `isConfigured: true`
- `sampleEscrowPda`
