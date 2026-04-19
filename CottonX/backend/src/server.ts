/**
 * server.ts — Express + WebSocket server for Cloud Run.
 *
 * Combines the functionality of:
 *  - AWS API Gateway (HTTP + WebSocket)
 *  - AWS Lambda (chatQueueHandler + queueChatExecutor)
 *  - AWS SQS (message queue)
 *
 * All in a single process:
 *  1. WebSocket connections are tracked in-memory (wsManager)
 *  2. Incoming "sendMessage" WebSocket frames are processed asynchronously
 *     by calling processChat() directly (no queue needed)
 *  3. A health-check HTTP endpoint is exposed for Cloud Run probes
 */

import 'dotenv/config';
import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { URL } from 'url';
import cors from 'cors';
import { ethers } from 'ethers';

import { wsManager } from './ws/manager';
import { processChat, InvokeModelPayload } from './lambda/queueChatExecutor';
import { logConsole } from './utils';

// ── Rate Limiter ─────────────────────────────────────────────────────────────
const GLOBAL_RPM_LIMIT = 500;
let currentRequestsThisMinute = 0;

setInterval(() => {
  currentRequestsThisMinute = 0;
}, 60000); // Reset bucket every 60 seconds


const PORT = parseInt(process.env.PORT || '8080', 10);

// ── Express app ──────────────────────────────────────────────────────────────

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increase limit for contract files

app.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'cottonx',
    connections: wsManager.getActiveConnections().length,
  });
});

// ── Contract Upload Endpoint ─────────────────────────────────────────────────

import { storeContractFile, compileContract, getContractFile } from './lambda/tools/handlers/deploy-custom-contract';
import { createItem } from './lambda/dynamo_v3';
import solc from 'solc';

app.post('/api/contracts/upload', async (req, res) => {
  try {
    const { userId, fileName, sourceCode, contractName } = req.body;

    if (!userId || !fileName || !sourceCode || !contractName) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: userId, fileName, sourceCode, contractName'
      });
    }

    logConsole.info(`Received contract upload from user ${userId}: ${fileName}`);

    // Validate Solidity code (basic check)
    if (!sourceCode.includes('pragma solidity') && !sourceCode.includes('pragma Solidity')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Solidity file. Must contain pragma solidity statement.'
      });
    }

    // Try to compile to validate
    const compiled = compileContract(sourceCode, contractName);
    
    if (!compiled.success) {
      return res.status(400).json({
        success: false,
        error: 'Compilation failed',
        details: compiled.error
      });
    }

    // Store the contract file
    const contractFile = await storeContractFile(userId, fileName, sourceCode, contractName);
    
    // Update with compiled data
    contractFile.compiled = true;
    contractFile.abi = compiled.abi;
    contractFile.bytecode = compiled.bytecode;
    contractFile.compilerVersion = solc.version();

    // Store again with compiled data
    await createItem(
      `contract_files#${userId}`,
      `file#${contractFile.fileId}`,
      contractFile,
      process.env.CORE_TABLE_NAME as string,
      null
    );

    res.json({
      success: true,
      message: 'Contract uploaded and compiled successfully',
      data: {
        fileId: contractFile.fileId,
        fileName: contractFile.fileName,
        contractName: contractFile.contractName,
        compiled: true,
        compilerVersion: contractFile.compilerVersion
      }
    });

  } catch (error: any) {
    logConsole.error('Error uploading contract:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

// ── Get Contract Data Endpoint ───────────────────────────────────────────────
app.get('/api/contracts/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    const userId = req.query.userId as string;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId query parameter is required'
      });
    }

    const contractFile = await getContractFile(userId, fileId);

    if (!contractFile) {
      return res.status(404).json({
        success: false,
        error: 'Contract file not found'
      });
    }

    if (!contractFile.compiled || !contractFile.abi || !contractFile.bytecode) {
      return res.status(400).json({
        success: false,
        error: 'Contract not compiled'
      });
    }

    res.json({
      success: true,
      data: {
        fileId: contractFile.fileId,
        contractName: contractFile.contractName,
        abi: contractFile.abi,
        bytecode: contractFile.bytecode,
        compilerVersion: contractFile.compilerVersion
      }
    });

  } catch (error: any) {
    logConsole.error('Error fetching contract:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

// ── Deploy Contract Endpoint (Backend execution with user approval) ─────────
app.post('/api/contracts/deploy', async (req, res) => {
  try {
    const { 
      userId, 
      fileId, 
      constructorArgs,
      userAddress // User's wallet address for verification
    } = req.body;

    if (!userId || !fileId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: userId, fileId'
      });
    }

    logConsole.info(`Deploying contract for user ${userId}, fileId: ${fileId}`);

    // Get contract file
    const contractFile = await getContractFile(userId, fileId);
    if (!contractFile) {
      return res.status(404).json({
        success: false,
        error: 'Contract file not found'
      });
    }

    if (!contractFile.compiled || !contractFile.abi || !contractFile.bytecode) {
      return res.status(400).json({
        success: false,
        error: 'Contract not compiled'
      });
    }

    // Deploy using backend wallet
    const rpcUrl = process.env.BASE_RPC_URL;
    const privateKey = process.env.AGENT_MASTER_PRIVATE_KEY;

    if (!rpcUrl || !privateKey) {
      return res.status(500).json({
        success: false,
        error: 'Backend wallet not configured (missing BASE_RPC_URL or AGENT_MASTER_PRIVATE_KEY)'
      });
    }

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const deployerWallet = new ethers.Wallet(privateKey, provider);

    logConsole.info(`Deploying with wallet: ${deployerWallet.address}`);

    // Check balance
    const balance = await provider.getBalance(deployerWallet.address);
    logConsole.info(`Deployer balance: ${ethers.formatEther(balance)} HELA`);

    if (balance < ethers.parseEther("0.0001")) {
      return res.status(400).json({
        success: false,
        error: "Insufficient HELA balance for deployment"
      });
    }

    // Create contract factory
    const factory = new ethers.ContractFactory(
      contractFile.abi,
      contractFile.bytecode,
      deployerWallet
    );

    // Parse constructor args
    const args = constructorArgs || [];

    // Deploy
    logConsole.info(`Deploying contract with ${args.length} constructor arguments`);
    const contract = await factory.deploy(...args);
    
    logConsole.info(`Deployment transaction sent: ${contract.deploymentTransaction()?.hash}`);

    // Wait for deployment
    await contract.waitForDeployment();
    const contractAddress = await contract.getAddress();
    const txHash = contract.deploymentTransaction()?.hash;

    logConsole.info(`Contract deployed at: ${contractAddress}`);

    // Record deployment
    const deploymentId = crypto.randomUUID();
    await createItem(
      `deployments#${userId}`,
      `deployment#${deploymentId}`,
      {
        deploymentId,
        userId,
        fileId,
        contractName: contractFile.contractName,
        contractAddress,
        transactionHash: txHash,
        deployerAddress: deployerWallet.address,
        userAddress: userAddress || '',
        network: 'hela-testnet',
        constructorArgs: args,
        deployedAt: new Date().toISOString()
      },
      process.env.CORE_TABLE_NAME as string,
      null
    );

    res.json({
      success: true,
      message: 'Contract deployed successfully',
      data: {
        contractAddress,
        transactionHash: txHash,
        deployerAddress: deployerWallet.address,
        contractName: contractFile.contractName
      }
    });

  } catch (error: any) {
    logConsole.error('Error deploying contract:', error);
    logConsole.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      error: error.message || 'Deployment failed',
      details: error.stack
    });
  }
});

app.get('/health', (_req, res) => {
  res.json({ status: 'healthy' });
});

// ── HTTP server + WebSocket upgrade ──────────────────────────────────────────

const server = http.createServer(app);
const wss = new WebSocketServer({ noServer: true });

server.on('upgrade', (request, socket, head) => {
  // Parse query params from the upgrade URL
  const baseUrl = `http://${request.headers.host || 'localhost'}`;
  const url = new URL(request.url || '/', baseUrl);
  const sessionId = url.searchParams.get('sessionId');
  const characterId = url.searchParams.get('characterId');

  if (!sessionId || !characterId) {
    logConsole.warn('WebSocket upgrade rejected — missing sessionId or characterId');
    socket.write('HTTP/1.1 400 Bad Request\r\n\r\n');
    socket.destroy();
    return;
  }

  wss.handleUpgrade(request, socket, head, (ws) => {
    // Attach metadata to the WebSocket object
    (ws as any).sessionId = sessionId;
    (ws as any).characterId = characterId;
    wss.emit('connection', ws, request);
  });
});

// ── WebSocket events ─────────────────────────────────────────────────────────

wss.on('connection', (ws: WebSocket) => {
  const sessionId: string = (ws as any).sessionId;
  const characterId: string = (ws as any).characterId;

  // Register in the connection manager
  wsManager.register(sessionId, characterId, ws);
  logConsole.info(`[WS] Connected: session=${sessionId}, character=${characterId}`);

  ws.on('message', async (raw: Buffer) => {
    try {
      const body = JSON.parse(raw.toString());

      if (body.action === 'sendMessage') {
        logConsole.info(`[WS] sendMessage from ${body.characterId}: ${body.data?.substring(0, 100)}`);

        const payload: InvokeModelPayload = {
          createdBy: body.createdBy,
          sendersWalletAddress: body.sendersWalletAddress || '',
          temperature: body.temperature || 0,
          characterId: body.characterId || characterId,
          sessionId: body.sessionId || sessionId,
          data: body.data,
          chatMode: body.chatMode || 'STANDARD',
          maxTokens: body.maxLength || 4096,
          topP: body.topP || 0.9,
          llmProvider: body.llmProvider,
          llmModelId: body.llmModelId,
        };

        currentRequestsThisMinute++;
        if (currentRequestsThisMinute > GLOBAL_RPM_LIMIT) {
          logConsole.warn('[WS] Global Rate limit exceeded (500 RPM)! Dropping message.');
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ error: 'System Rate Limit Exceeded: The servers are cooling down. Please try again in 60 seconds.' }));
          }
          return;
        }

        // Process asynchronously — don't block the WebSocket frame handler
        processChat(payload).catch((err) => {
          logConsole.error(`[WS] processChat error:`, err);
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ error: 'Processing failed. Please try again.' }));
          }
        });

        // Acknowledge immediately
        // (the response will come via wsManager.sendMessage in processChat)
      } else {
        logConsole.warn(`[WS] Unknown action: ${body.action}`);
      }
    } catch (err) {
      logConsole.error('[WS] Failed to parse message:', err);
    }
  });

  ws.on('close', () => {
    logConsole.info(`[WS] Disconnected: session=${sessionId}, character=${characterId}`);
  });

  ws.on('error', (err) => {
    logConsole.error(`[WS] Error for session=${sessionId}, character=${characterId}:`, err);
  });
});

// ── Start ────────────────────────────────────────────────────────────────────

server.listen(PORT, () => {
  logConsole.info(`🚀 CottonX server running on port ${PORT}`);
  logConsole.info(`   HTTP:  http://localhost:${PORT}`);
  logConsole.info(`   WS:    ws://localhost:${PORT}?sessionId=xxx&characterId=yyy`);
});
