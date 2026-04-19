# Custom Contract Deployment System

## Overview
Users can upload custom Solidity contracts (.sol files) and have Rishi deploy them to the HeLa testnet.

## How It Works

### 1. Upload Contract
Users upload their .sol file through the frontend upload button (amber upload icon next to chat input).

**Endpoint:** `POST /api/contracts/upload`

**Request Body:**
```json
{
  "userId": "user_xxx",
  "fileName": "MyContract.sol",
  "sourceCode": "pragma solidity ^0.8.0; contract MyContract { ... }",
  "contractName": "MyContract"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Contract uploaded and compiled successfully",
  "data": {
    "fileId": "uuid-here",
    "fileName": "MyContract.sol",
    "contractName": "MyContract",
    "compiled": true,
    "compilerVersion": "0.8.x"
  }
}
```

### 2. Deploy Contract
After upload, users ask Rishi to deploy the contract. Rishi uses the `Deploy_Custom_Contract_Tool`.

**Tool Parameters:**
- `sessionId`: Current session ID
- `createdBy`: User ID
- `characterId`: "Rishi"
- `fileId`: The UUID returned from upload
- `constructorArgs`: (optional) Array of constructor arguments

**Example User Messages:**
- "Deploy my SimpleToken contract"
- "Deploy the contract I just uploaded"
- "Can you deploy that NFT contract with name 'CoolNFT' and symbol 'CNFT'"

### 3. Storage Structure

**Contract Files:**
- PK: `contract_files#{userId}`
- SK: `file#{fileId}`
- Data: ContractFile object with source code, ABI, bytecode

**Deployments:**
- PK: `deployments#{userId}`
- SK: `deployment#{deploymentId}`
- Data: Deployment info with contract address, tx hash, network

## Sample Contracts

Located in `backend/sample-contracts/`:
- `SimpleToken.sol` - Basic ERC20-like token
- `SimpleNFT.sol` - Basic NFT contract

## Testing

Run: `npx tsx test-custom-contract.ts`

This tests:
1. Contract compilation
2. File storage
3. File retrieval

## Rishi's Instructions

When a user mentions deploying a contract:
1. Check if they recently uploaded a file (look for success message in chat)
2. Extract the fileId from the upload confirmation
3. Ask for constructor arguments if needed
4. Use Deploy_Custom_Contract_Tool with the fileId
5. Confirm deployment with contract address

## Common Issues

1. **"Tool not found"** - Rishi needs 'wallet' skill in Firestore
2. **"Contract file not found"** - fileId is incorrect or file wasn't uploaded
3. **"Compilation failed"** - Solidity syntax errors in uploaded file
4. **"Insufficient balance"** - Wallet needs HELA tokens for gas

## Constructor Arguments

If contract has constructor parameters, user must provide them:
- Token contracts: name, symbol, totalSupply
- NFT contracts: name, symbol
- Custom contracts: varies by contract

Example: "Deploy SimpleToken with name 'MyToken', symbol 'MTK', and supply 1000000"
