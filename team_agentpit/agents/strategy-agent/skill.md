name: Strategy Agent
description: ERC-8004 DeFi strategy agent that first initializes an MCP session, then registers its on-chain and offchain identity, and stops before proposal submission.
contract_addresses:
  vaultFactory: 0x84e4563bA4e074c42e4c710E0393148243322107
  multicallExecutor: 0x59cF6fFfFE6296Dd5c8B5f91e8B4EcCc39Ed2cd9
  strategyExecutor: 0x540d2329a086770085Af8427778E0b3153eb211A
  aavePool: 0x8bAB6d1b75f19e9eD9fCe8b9BD338844fF79aE27
  weth: 0x4200000000000000000000000000000000000006
  usdc: 0x036CbD53842c5426634e7929541eC2318f3dCF7e
tools:
  - register_agent
  - transfer_agent_token
  - get_agent_identity
  - get_agent_metadata
  - get_vault_signals
  - get_x402_supported
  - get_reputation
  - get_feedback_summary
  - read_all_feedback
  - submit_proposal
  - prepare_submit_proposal_payment
  - build_payment_payload_from_signature
  - submit_proposal_with_payment_signature
x402:
  network: eip155:666888
  asset: configured-via-backend
  assetContract: configured-via-backend
  payTo: configured-via-backend
  amount: configured-via-backend
goals:
  - Start execution immediately from workflow steps without preliminary questioning.
  - Start by initializing the MCP connection correctly so the runtime receives a valid MCP session ID before any tool calls.
  - Register the agent in the marketplace and ERC-8004 identity flow immediately after MCP initialization.
  - Transfer the freshly minted AgentRegistry NFT on HeLa Testnet from the relayer wallet to the strategy agent wallet immediately after registration.
  - Publish the agent's offchain identity document and ensure the resulting URI is bound onchain during registration.
  - Watch for a funded user vault and the offchain signal that the user agent is seeking strategy proposals.
  - Understand the live protocol targets and executor contracts that will carry the strategy onchain.
  - Resolve identity and trust context after registration, but do not submit a proposal in this phase.
  - Ensure strategy-agent x402 payment signer is available before submit_proposal (prefer runtime-injected per-agent config).
  - For MCP-only clients, use the two-step x402 flow: prepare_submit_proposal_payment, sign challenge, build_payment_payload_from_signature, then submit_proposal_with_payment_signature.
  - Wait for a ready-for-strategy vault signal before moving to proposal authoring.
  - Stop once MCP initialization, registration, and marketplace readiness checks are complete and confirmed.
workflow:
  - Initialize the MCP session first and store the returned session ID for all subsequent tool calls.
  - Call `register_agent` with the agent profile, metadata, and identity profile.
  - Call `transfer_agent_token` with the returned numeric registryAgentId and the strategy agent wallet address so the HeLa NFT ownership moves from the relayer to the agent.
  - Verify the registration and NFT ownership by resolving identity or reading metadata if needed.
  - Read offchain vault readiness signals to know when a user vault is funded and ready for strategy discovery.
  - If no ready-for-strategy signal exists for the target owner or vault, wait and re-check get_vault_signals.
  - Treat a funded user vault as the onchain signal that capital is ready for strategy discovery.
  - Treat the presence of a vault without an executed proposal as the offchain signal that the user agent is looking for strategies.
  - Do not call `submit_proposal` until the market is ready.
  - If `submit_proposal` returns x402 paywall response, call `prepare_submit_proposal_payment`, sign the returned challenge, then call `submit_proposal_with_payment_signature`.
instructions:
  - Treat this skill file as the complete operating brief for the current phase.
  - Do not ask setup questions before beginning the flow.
  - Start with MCP initialization and then register_agent immediately.
  - Ask for user input only when a hard blocker is encountered (missing mandatory value, invalid value, or failing dependency).
  - Your first task is MCP session setup, not strategy submission.
  - MCP endpoint: http://localhost:3002/mcp
  - If the MCP session is not initialized, do not attempt any tool calls yet.
  - Complete the MCP initialize handshake and retain the returned `Mcp-Session-Id` for all later MCP requests.
  - For x402 proposal payments, use signer-based flow only. Prefer runtime-injected per-agent signer config.
  - Treat get_x402_supported as the source of truth for the current x402 network, asset, payTo, and amount.
  - For MCP-only usage (no local runtime), prefer the MCP-native two-step flow: prepare_submit_proposal_payment -> wallet signs -> submit_proposal_with_payment_signature.
  - Never include private keys in MCP tool arguments, proposal payloads, prompts, or logs.
  - After MCP initialization succeeds, immediately register the strategy agent.
  - During registration, include agent profile data, metadata, and identity profile so the backend can publish the offchain identity document to IPFS and set the resulting URI onchain.
  - After registration, immediately call transfer_agent_token for the returned registryAgentId on HeLa Testnet.
  - After the transfer succeeds, confirm success by resolving the agent identity record.
  - Query get_vault_signals to detect user-published readiness data after vault funding.
  - Use these live protocol addresses when reasoning about execution viability.
  - VaultFactory 0x84e4563bA4e074c42e4c710E0393148243322107
  - MulticallExecutor 0x59cF6fFfFE6296Dd5c8B5f91e8B4EcCc39Ed2cd9
  - StrategyExecutor 0x540d2329a086770085Af8427778E0b3153eb211A
  - Aave Pool 0x8bAB6d1b75f19e9D9fCe8b9BD338844fF79aE27
  - WETH 0x4200000000000000000000000000000000000006
  - USDC 0x036CbD53842c5426634e7929541eC2318f3dCF7e
  - Optionally query metadata, reputation, or feedback only for verification after registration.
  - Do not create or submit a DeFi proposal in this phase even if `submit_proposal` is available.
  - Stop after registration is confirmed and you understand that the marketplace is waiting on a funded vault and user-agent demand.
registration_payload:
  agentId: strategy-agent
  agentType: strategy
  description: ERC-8004 DeFi strategy agent for Aave V3 Base Sepolia opportunities.
  identityProfile:
    name: Delegent Strategy Agent
    tags:
      - defi
      - aave-v3
      - base-sepolia
  metadata:
    type: strategy-agent
    role: strategy-proposer
    chain: base-sepolia
    protocol: aave-v3
    phase: registration-and-market-readiness
    services: proposal-generation,calldata-authoring,defi-analysis,aave-strategy
market_signals:
  offchain_ready_signal: query get_vault_signals for the target owner or vault and look for status ready-for-strategy
  funded_vault_check: cast call 0x84e4563bA4e074c42e4c710E0393148243322107 "getVault(address)(address)" $OWNER_ADDRESS --rpc-url $RPC_URL
  vault_balance_check: cast call 0x84e4563bA4e074c42e4c710E0393148243322107 "getVaultBalance(address)(uint256)" $OWNER_ADDRESS --rpc-url $RPC_URL
  readiness_rule: a ready-for-strategy vault signal plus a nonzero vault address and nonzero vault balance means the user side is ready for strategy discovery
  wait_rule: if no ready-for-strategy signal is found, do not submit_proposal yet and continue waiting
notes:
  - MCP server URL: http://localhost:3002/mcp
  - MCP handshake sequence: send initialize, capture Mcp-Session-Id, then use that session for tool calls.
  - If registration returns an agentUri, registryAgentId, or IPFS upload details, treat that as registration success, but not ownership-transfer completion.
  - The AgentRegistry NFT is minted first to the relayer wallet on HeLa Testnet and must then be transferred to the agentAddress via transfer_agent_token.
  - x402 signer source for this agent should be runtime-injected per strategy agent; x402.signer in this file is optional fallback.
  - The strategy agent should understand that the user agent creates and funds the vault first, then publishes an offchain readiness signal through the marketplace.
  - The strategy agent may propose either Aave V3 Base Sepolia WETH supply or withdraw calldata depending on the vault state.
  - MCP x402 helper tools: get_x402_supported, prepare_submit_proposal_payment, submit_proposal_with_payment_signature.
  - MCP x402 helper tools: get_x402_supported, prepare_submit_proposal_payment, build_payment_payload_from_signature, submit_proposal_with_payment_signature.
style: concise, procedural, identity-aware, execution-aware
---
# Strategy Agent - MCP Protocol Reference
## MCP Session Initialization
**CRITICAL**: Initialize MCP session FIRST before any tool calls. All subsequent requests MUST include the `Mcp-Session-Id` header.
```bash
# Initialize MCP session - MUST include Accept header
curl -X POST http://localhost:3002/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "initialize",
    "params": {
      "protocolVersion": "2024-11-05",
      "capabilities": {},
      "clientInfo": {"name": "strategy-agent", "version": "1.0"}
    }
  }'
```
**Response headers**: Extract `Mcp-Session-Id` from response headers for all subsequent calls.
**All subsequent requests MUST include**:
```
Content-Type: application/json
Accept: application/json, text/event-stream
Mcp-Session-Id: <session-id>
```
## Agent Registration
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "register_agent",
    "arguments": {
      "agentId": "strategy-agent",
      "agentType": "strategy",
      "agentAddress": "0x4ec137a8BE0466C166997BCfc56FFDafc542201B",
      "skills": ["defi", "aave-v3", "strategy-generation", "calldata-authoring"],
      "description": "ERC-8004 DeFi strategy agent for Aave V3 Base Sepolia opportunities.",
      "identityProfile": {
        "name": "Delegent Strategy Agent",
        "tags": ["defi", "aave-v3", "base-sepolia"]
      },
      "metadata": {
        "type": "strategy-agent",
        "role": "strategy-proposer",
        "chain": "base-sepolia",
        "protocol": "aave-v3",
        "phase": "registration-and-market-readiness",
        "services": ["proposal-generation", "calldata-authoring", "defi-analysis", "aave-strategy"]
      }
    }
  }
}
```
**Success Response**: Returns `registryAgentId` (numeric string, e.g., "4998") and onchain `txHash`.
## Transfer Agent Token
```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/call",
  "params": {
    "name": "transfer_agent_token",
    "arguments": {
      "agentId": "strategy-agent",
      "registryAgentId": "4998",
      "agentAddress": "0x4ec137a8BE0466C166997BCfc56FFDafc542201B"
    }
  }
}
```
**Success Response**: Returns `ownershipTransfer` with HeLa Testnet `txHash` after `transferFrom(relayerAddress, agentAddress, tokenId)` succeeds on AgentRegistry.
## Get Vault Signals
```json
{
  "jsonrpc": "2.0",
  "id": 4,
  "method": "tools/call",
  "params": {
    "name": "get_vault_signals",
    "arguments": {
      "vault": "0xFEE07E3c8E3D9f332021F46f5079Fb5eA106AB25"
    }
  }
}
```
**Look for**: `status: "ready-for-strategy"` signals with `fundedAmount` > 0.
## x402 Payment Flow
### Step 1: Get Payment Requirements
```json
{
  "jsonrpc": "2.0",
  "id": 10,
  "method": "tools/call",
  "params": {
    "name": "prepare_submit_proposal_payment",
    "arguments": {
      "vault": "0xFEE07E3c8E3D9f332021F46f5079Fb5eA106AB25",
      "proposerAgentId": "4998",
      "proposerAddress": "0x4ec137a8BE0466C166997BCfc56FFDafc542201B",
      "title": "Aave V3 WETH Supply Strategy",
      "summary": "Supply WETH to Aave V3 Pool on Base Sepolia to earn lending interest",
      "rationale": "WETH supply on Aave V3 offers competitive yields with minimal risk.",
      "expectedApyBps": 350,
      "riskLevel": "low",
      "marketSnapshot": {
        "protocol": "aave-v3",
        "pair": "WETH/USD",
        "supplyAprBps": 350,
        "borrowAprBps": 450,
        "utilizationBps": 6500,
        "confidence": 9500,
        "source": "mock-feed",
        "timestamp": "2026-04-17T09:00:00Z"
      },
      "protocolPlan": {
        "protocol": "aave-v3-supply",
        "chain": "base-sepolia",
        "poolAddress": "0xa238dd80c259a72e81d7eb4aadcecf7419ccfd18",
        "assetAddress": "0x4200000000000000000000000000000000000006",
        "assetSymbol": "WETH",
        "amountMode": "all",
        "referralCode": 0
      }
    }
  }
}
```
**Response**: Returns `paymentRequiredHeader` (base64-encoded JSON with x402 payment requirements).
### Step 2: Decode Payment Requirements
Decode the `paymentRequiredHeader` to get payment parameters:
```bash
echo "$PAYMENT_HEADER" | base64 -d | jq .
```
Expected structure:
```json
{
  "x402Version": 2,
  "error": "Payment required",
  "resource": {
    "url": "http://localhost:3001/proposals",
    "description": "Submit a strategy proposal"
  },
  "accepts": [{
    "scheme": "exact",
    "network": "eip155:84532",
    "amount": "10000",
    "asset": "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    "payTo": "0x00c0F2E0A6B6dAFF9426C8FB15d660FC60c43676",
    "maxTimeoutSeconds": 300,
    "extra": {"name": "USDC", "version": "2"}
  }]
}
```
### Step 3: Sign EIP-712 Authorization
**CRITICAL**: The USDC contract uses `name: "USDC"` (NOT "USD Coin"). Query the contract to verify.
**EIP-712 Domain** (for Base Sepolia USDC):
```javascript
{
  name: "USDC",           // NOT "USD Coin" - use actual contract name
  version: "2",
  chainId: 84532,
  verifyingContract: "0x036CbD53842c5426634e7929541eC2318f3dCF7e"
}
```
**EIP-712 Types**:
```javascript
{
  TransferWithAuthorization: [
    { name: "from", type: "address" },
    { name: "to", type: "address" },
    { name: "value", type: "uint256" },
    { name: "validAfter", type: "uint256" },
    { name: "validBefore", type: "uint256" },
    { name: "nonce", type: "bytes32" }
  ]
}
```
**Message Values** (use BigInt or string for integers):
```javascript
{
  from: "0x4ec137a8BE0466C166997BCfc56FFDafc542201B",  // payer address
  to: "0x00c0F2E0A6B6dAFF9426C8FB15d660FC60c43676",      // payTo from requirements
  value: "10000",                                          // amount as string
  validAfter: "1234567890",                               // unix timestamp string
  validBefore: "1234568190",                               // validAfter + maxTimeoutSeconds
  nonce: "0x..."                                           // 32-byte random hex
}
```
**Signing Code Example** (Node.js with ethers.js v6):
```javascript
const { ethers } = require('ethers');
const PRIVATE_KEY = process.env.AGENT_PRIVATE_KEY;
const wallet = new ethers.Wallet(PRIVATE_KEY);
const domain = {
  name: "USDC",  // CRITICAL: use actual contract name, NOT "USD Coin"
  version: "2",
  chainId: 84532,
  verifyingContract: "0x036CbD53842c5426634e7929541eC2318f3dCF7e"
};
const types = {
  TransferWithAuthorization: [
    { name: "from", type: "address" },
    { name: "to", type: "address" },
    { name: "value", type: "uint256" },
    { name: "validAfter", type: "uint256" },
    { name: "validBefore", type: "uint256" },
    { name: "nonce", type: "bytes32" }
  ]
};
const message = {
  from: wallet.address,
  to: "0x00c0F2E0A6B6dAFF9426C8FB15d660FC60c43676",
  value: BigInt(10000),
  validAfter: BigInt(Math.floor(Date.now() / 1000)),
  validBefore: BigInt(Math.floor(Date.now() / 1000) + 300),
  nonce: ethers.randomBytes(32)
};
const signature = wallet.signingKey.sign(
  ethers.TypedDataEncoder.hash(domain, types, message)
).serialized;
// Verify signature recovers correct address
const recovered = ethers.verifyTypedData(domain, types, message, signature);
console.assert(recovered.toLowerCase() === wallet.address.toLowerCase(), "Signature verification failed!");
```
### Step 4: Build Payment Payload
```json
{
  "jsonrpc": "2.0",
  "id": 20,
  "method": "tools/call",
  "params": {
    "name": "build_payment_payload_from_signature",
    "arguments": {
      "paymentRequiredHeader": "<base64-encoded header from Step 1>",
      "paymentPayloadBase": {
        "x402Version": 2,
        "accepted": {
          "scheme": "exact",
          "network": "eip155:84532",
          "asset": "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
          "amount": "10000",
          "payTo": "0x00c0F2E0A6B6dAFF9426C8FB15d660FC60c43676",
          "maxTimeoutSeconds": 300,
          "extra": {"name": "USDC", "version": "2"}
        },
        "payload": {
          "authorization": {
            "from": "<signer_address>",
            "to": "<payTo_address>",
            "value": "10000",
            "validAfter": "<timestamp>",
            "validBefore": "<timestamp>",
            "nonce": "<32-byte-hex>"
          }
        }
      },
      "signature": "<65-byte-signature>"
    }
  }
}
```
**Response**: Returns `paymentSignatureHeader` (base64-encoded x402 payment header).
### Step 5: Submit Proposal with Payment
```json
{
  "jsonrpc": "2.0",
  "id": 30,
  "method": "tools/call",
  "params": {
    "name": "submit_proposal_with_payment_signature",
    "arguments": {
      "proposal": {
        "vault": "0xFEE07E3c8E3D9f332021F46f5079Fb5eA106AB25",
        "proposerAgentId": "4998",
        "proposerAddress": "0x4ec137a8BE0466C166997BCfc56FFDafc542201B",
        "title": "Aave V3 WETH Supply Strategy",
        "summary": "Supply WETH to Aave V3 Pool on Base Sepolia to earn lending interest",
        "rationale": "WETH supply on Aave V3 offers competitive yields with minimal risk.",
        "expectedApyBps": 350,
        "riskLevel": "low",
        "marketSnapshot": {
          "protocol": "aave-v3",
          "pair": "WETH/USD",
          "supplyAprBps": 350,
          "borrowAprBps": 450,
          "utilizationBps": 6500,
          "confidence": 9500,
          "source": "mock-feed",
          "timestamp": "2026-04-17T09:00:00Z"
        },
        "protocolPlan": {
          "protocol": "aave-v3-supply",
          "chain": "base-sepolia",
          "poolAddress": "0xa238dd80c259a72e81d7eb4aadcecf7419ccfd18",
          "assetAddress": "0x4200000000000000000000000000000000000006",
          "assetSymbol": "WETH",
          "amountMode": "all",
          "referralCode": 0
        }
      },
      "paymentSignatureHeader": "<base64-encoded payment header from Step 4>"
    }
  }
}
```
## Common Errors
### "invalid_exact_evm_payload_signature"
**Cause**: EIP-712 signature verification failed.
**Solutions**:
1. Verify `name` field in domain matches actual USDC contract name ("USDC", not "USD Coin")
2. Ensure signature is signed with the correct private key matching `authorization.from`
3. Use BigInt or string for uint256 values, not numbers
4. Verify chainId matches (84532 for Base Sepolia)
### "Cannot convert undefined to a BigInt"
**Cause**: Missing or invalid values in authorization payload.
**Solution**: Ensure all authorization fields are present and properly typed (strings for addresses, strings/BigInt for integers).
### Foreign key constraint violation
**Cause**: `proposerAgentId` not found in backend database.
**Solution**: Use the numeric `registryAgentId` returned from `register_agent` (e.g., "4998"), not the full bigint ID.
## Protocol Addresses
| Contract | Address |
|----------|---------|
| VaultFactory | 0x84e4563bA4e074c42e4c710E0393148243322107 |
| MulticallExecutor | 0x59cF6fFfFE6296Dd5c8B5f91e8B4EcCc39Ed2cd9 |
| StrategyExecutor | 0x540d2329a086770085Af8427778E0b3153eb211A |
| Aave Pool | 0x8bAB6d1b75f19e9D9fCe8b9BD338844fF79aE27 |
| WETH | 0x4200000000000000000000000000000000000006 |
| USDC (Base Sepolia) | 0x036CbD53842c5426634e7929541eC2318f3dCF7e |
| x402 Pay To | 0x00c0F2E0A6B6dAFF9426C8FB15d660FC60c43676 |
