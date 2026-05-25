# Custom Smart Contract Deployment Guide

## Overview
Users can upload custom Solidity contracts and deploy them to HeLa testnet with MetaMask approval but backend execution.

## How It Works

### Architecture
1. **Upload** → Frontend uploads .sol file → Backend compiles and stores
2. **Approve** → User signs message in MetaMask to approve deployment
3. **Deploy** → Backend deploys using master private key
4. **Record** → Deployment info stored in database

### Why This Approach?
- **User Control**: MetaMask signature ensures user explicitly approves
- **Gas Efficiency**: Backend pays gas fees (no user HELA needed)
- **Reliability**: Backend wallet has guaranteed balance
- **Security**: User's private key never exposed

## User Flow

### Step 1: Upload Contract
1. Click the amber upload button (📤) next to chat input
2. Select your `.sol` file
3. Backend compiles and validates the contract
4. Success message shows with "Deploy" button

### Step 2: Deploy Contract
1. Click "Deploy to HeLa Testnet" button
2. (Optional) Enter constructor arguments as JSON array
   - Example: `["MyToken", "MTK", "1000000"]`
3. MetaMask popup appears - Sign the message to approve
4. Backend deploys the contract
5. Contract address and transaction hash displayed

### Step 3: Verify Deployment
- Contract address shown in success message
- Transaction hash provided for block explorer
- Deployment recorded in database

## Technical Details

### Frontend Components

**ContractDeployer.tsx**
- Handles MetaMask signature for approval
- Calls backend API for deployment
- Shows deployment status and results

**Chat.tsx**
- Upload button integrated into chat
- Shows ContractDeployer when contract uploaded
- Displays deployment success in chat

### Backend Endpoints

**POST /api/contracts/upload**
- Receives .sol file content
- Compiles using solc
- Stores in database with ABI and bytecode
- Returns fileId

**POST /api/contracts/deploy**
- Receives fileId and constructor args
- Deploys using AGENT_MASTER_PRIVATE_KEY
- Records deployment in database
- Returns contract address and tx hash

**GET /api/contracts/:fileId**
- Fetches compiled contract data
- Returns ABI and bytecode
- Used for verification

### Database Schema

**Contract Files**
```typescript
{
  fileId: string;
  userId: string;
  fileName: string;
  sourceCode: string;
  contractName: string;
  uploadedAt: string;
  compiled: boolean;
  abi?: any[];
  bytecode?: string;
  compilerVersion?: string;
}
```

**Deployments**
```typescript
{
  deploymentId: string;
  userId: string;
  fileId: string;
  contractName: string;
  contractAddress: string;
  transactionHash: string;
  deployerAddress: string; // Backend wallet
  userAddress: string; // User's wallet (for reference)
  network: string;
  constructorArgs: any[];
  deployedAt: string;
}
```

## Sample Contracts

Located in `backend/sample-contracts/`:

### SimpleToken.sol
Basic ERC20-like token with:
- Transfer functionality
- Approve/transferFrom
- Balance tracking

Constructor: `["TokenName", "SYMBOL", "1000000"]`

### SimpleNFT.sol
Basic NFT contract with:
- Minting
- Transfer
- Approval system

Constructor: `["CollectionName", "SYMBOL"]`

## Environment Variables

### Backend (.env)
```bash
BASE_RPC_URL=https://testnet-rpc.helachain.com
AGENT_MASTER_PRIVATE_KEY=your_private_key_here
CORE_TABLE_NAME=CoreTable
```

### Frontend (.env.local)
```bash
NEXT_PUBLIC_BACKEND_URL=http://localhost:8080
```

## Testing

### Test Upload
```bash
cd backend
npx tsx test-upload-endpoint.ts
```

### Test Compilation
```bash
cd backend
npx tsx test-custom-contract.ts
```

### Test Full Flow
1. Start backend: `cd backend && npm run dev`
2. Start frontend: `cd frontend && npm run dev`
3. Connect MetaMask to HeLa testnet
4. Upload a .sol file
5. Deploy the contract

## Troubleshooting

### "Compilation failed"
- Check Solidity syntax
- Ensure `pragma solidity` statement exists
- Verify contract name matches filename

### "Insufficient HELA balance"
- Backend wallet needs HELA for gas
- Get testnet HELA from faucet
- Check balance: `AGENT_MASTER_PRIVATE_KEY` wallet

### "User rejected"
- User cancelled MetaMask signature
- Try again and approve the signature

### "Contract file not found"
- FileId might be incorrect
- Re-upload the contract
- Check userId matches

## Security Considerations

1. **User Approval**: MetaMask signature required
2. **Backend Execution**: Master key secured in .env
3. **Input Validation**: Solidity code validated before compilation
4. **Constructor Args**: Parsed and validated
5. **Database**: User-specific storage with proper keys

## Future Enhancements

- [ ] Support for multiple networks
- [ ] Contract verification on block explorer
- [ ] Gas estimation before deployment
- [ ] Deployment history UI
- [ ] Contract interaction interface
- [ ] Template library
- [ ] Remix IDE integration

## Support

For issues or questions:
1. Check backend logs for deployment errors
2. Verify MetaMask is connected to HeLa testnet
3. Ensure backend server is running
4. Check browser console for frontend errors
