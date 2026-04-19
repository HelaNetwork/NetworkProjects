const express = require('express');
const router = express.Router();
const { authMiddleware, hrOnly } = require('../middleware/auth');
const { writeContract, readContract, provider } = require('../services/hela');
const { getDb } = require('../db/connection');
const { ethers } = require('ethers');

// Store pending transactions
const pendingTransactions = new Map();

// Get all streams (HR only)
router.get('/all', authMiddleware, hrOnly, async (req, res) => {
  try {
    const db = getDb();
    const userId = req.user.id;

    const streams = db.prepare(`
      SELECT 
        s.id,
        s.stream_id as streamId,
        s.employee_id as employeeId,
        s.total_amount as totalAmount,
        s.start_time as startTime,
        s.end_time as endTime,
        s.withdrawn_amount as withdrawnAmount,
        s.active,
        s.paused,
        s.tx_hash as txHash,
        s.created_at as createdAt,
        u.name as employeeName,
        u.email as employeeEmail,
        u.wallet_address as employeeWallet
      FROM streams s
      JOIN users u ON s.employee_id = u.id
      WHERE s.hr_id = ?
      ORDER BY s.created_at DESC
    `).all(userId);

    const streamsWithOnChainData = await Promise.all(
      streams.map(async (stream) => {
        try {
          const onChainStream = await readContract.getStream(stream.streamId);
          const availableBalance = await readContract.availableBalance(stream.streamId);

          return {
            ...stream,
            active: onChainStream.active,
            paused: onChainStream.paused,
            withdrawnAmount: ethers.formatEther(onChainStream.withdrawnAmount),
            availableBalance: ethers.formatEther(availableBalance),
            ratePerSecond: ethers.formatEther(onChainStream.ratePerSecond),
            pausedTime: Number(onChainStream.pausedTime),
            totalPausedDuration: Number(onChainStream.totalPausedDuration)
          };
        } catch (error) {
          console.error(`Error fetching stream ${stream.streamId}:`, error);
          return stream;
        }
      })
    );

    res.json({ streams: streamsWithOnChainData });
  } catch (error) {
    console.error('Error fetching streams:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get employee's streams (FIXED: Added employeeWallet)
router.get('/my-streams', authMiddleware, async (req, res) => {
  try {
    const db = getDb();
    const userId = req.user.id;

    const streams = db.prepare(`
      SELECT 
        s.id,
        s.stream_id as streamId,
        s.total_amount as totalAmount,
        s.start_time as startTime,
        s.end_time as endTime,
        s.withdrawn_amount as withdrawnAmount,
        s.active,
        s.paused,
        s.tx_hash as txHash,
        s.created_at as createdAt,
        hr.name as employerName,
        hr.email as employerEmail,
        u.wallet_address as employeeWallet
      FROM streams s
      JOIN users hr ON s.hr_id = hr.id
      JOIN users u ON s.employee_id = u.id
      WHERE s.employee_id = ?
      ORDER BY s.created_at DESC
    `).all(userId);

    const streamsWithOnChainData = await Promise.all(
      streams.map(async (stream) => {
        try {
          const onChainStream = await readContract.getStream(stream.streamId);
          const availableBalance = await readContract.availableBalance(stream.streamId);

          return {
            ...stream,
            active: onChainStream.active,
            paused: onChainStream.paused,
            withdrawnAmount: ethers.formatEther(onChainStream.withdrawnAmount),
            availableBalance: ethers.formatEther(availableBalance),
            ratePerSecond: ethers.formatEther(onChainStream.ratePerSecond),
            pausedTime: Number(onChainStream.pausedTime),
            totalPausedDuration: Number(onChainStream.totalPausedDuration),
            employeeWallet: stream.employeeWallet
          };
        } catch (error) {
          console.error(`Error fetching stream ${stream.streamId}:`, error);
          return stream;
        }
      })
    );

    res.json({ streams: streamsWithOnChainData });
  } catch (error) {
    console.error('Error fetching streams:', error);
    res.status(500).json({ error: error.message });
  }
});

// Check transaction status
router.get('/tx-status/:txHash', authMiddleware, async (req, res) => {
  try {
    const { txHash } = req.params;
    const pendingInfo = pendingTransactions.get(txHash);
    const receipt = await provider.getTransactionReceipt(txHash);
    
    if (receipt) {
      if (pendingInfo) {
        pendingTransactions.delete(txHash);
      }
      
      res.json({
        status: 'confirmed',
        blockNumber: receipt.blockNumber,
        success: receipt.status === 1,
        txHash: txHash
      });
    } else {
      const tx = await provider.getTransaction(txHash);
      if (tx) {
        res.json({
          status: 'pending',
          txHash: txHash,
          message: 'Transaction is still being processed'
        });
      } else {
        res.json({
          status: 'not_found',
          txHash: txHash,
          message: 'Transaction not found'
        });
      }
    }
  } catch (error) {
    console.error('Error checking tx status:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get contract configuration (NEW)
router.get('/config/contract-address', authMiddleware, async (req, res) => {
  try {
    res.json({
      contractAddress: process.env.PAYSTREAM_CONTRACT,
      hlusdToken: process.env.HLUSD_TOKEN,
      network: process.env.HELA_RPC_URL || 'https://testnet-rpc.helachain.com'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new stream (HR only)
router.post('/create', authMiddleware, hrOnly, async (req, res) => {
  try {
    const { employeeId, employeeAddress, totalAmount, duration } = req.body;
    const hrId = req.user.id;

    if (!employeeId || !employeeAddress || !totalAmount || !duration) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!ethers.isAddress(employeeAddress)) {
      return res.status(400).json({ error: 'Invalid employee address' });
    }

    const amountInWei = ethers.parseEther(totalAmount.toString());
    const tokenAddress = process.env.HLUSD_TOKEN;

    console.log('🚀 Creating stream with params:', {
      employee: employeeAddress,
      token: tokenAddress,
      totalAmount: amountInWei.toString(),
      duration: duration
    });

    const { ensureApproval } = require('../services/hela');
    console.log('📝 Checking token approval...');
    await ensureApproval(amountInWei);
    console.log('✅ Token approval confirmed');

    console.log('📤 Sending createStream transaction...');
    const tx = await writeContract.createStream(
      employeeAddress,
      tokenAddress,
      amountInWei,
      duration,
      {
        gasLimit: 500000,
      }
    );

    console.log('✅ Transaction sent:', tx.hash);

    pendingTransactions.set(tx.hash, {
      hrId,
      employeeId,
      employeeAddress,
      totalAmount,
      duration,
      timestamp: Date.now()
    });

    res.json({
      success: true,
      txHash: tx.hash,
      status: 'pending',
      message: 'Stream creation transaction submitted successfully',
      checkStatusUrl: `/api/streams/tx-status/${tx.hash}`
    });

    processStreamConfirmation(tx, hrId, employeeId, totalAmount, duration).catch(err => {
      console.error('❌ Background confirmation failed:', err);
    });

  } catch (error) {
    console.error('❌ Error creating stream:', error);
    
    let errorMessage = 'Failed to create stream';
    let errorDetails = error.code || 'UNKNOWN_ERROR';
    let tips = [];
    
    if (error.code === 'INSUFFICIENT_FUNDS') {
      errorMessage = 'Insufficient HeLa tokens for gas fees';
      tips.push('Add HeLa tokens to your server wallet');
    } else if (error.message && error.message.includes('insufficient allowance')) {
      errorMessage = 'Insufficient HLUSD token allowance';
      tips.push('Approval transaction may have failed');
    } else if (error.reason) {
      errorMessage = error.reason;
    } else if (error.message) {
      errorMessage = error.message;
    }

    res.status(500).json({ 
      error: errorMessage,
      details: errorDetails,
      tips: tips.length > 0 ? tips : ['Check server logs for details']
    });
  }
});

// Background confirmation processing
async function processStreamConfirmation(tx, hrId, employeeId, totalAmount, duration) {
  try {
    console.log('⏳ Waiting for confirmation (background process)...');
    const receipt = await tx.wait();
    console.log('✅ Transaction confirmed in block:', receipt.blockNumber);

    let streamId;
    try {
      const streamCreatedEvent = receipt.logs.find(log => {
        try {
          const parsed = readContract.interface.parseLog({
            topics: [...log.topics],
            data: log.data
          });
          return parsed && parsed.name === 'StreamCreated';
        } catch (e) {
          return false;
        }
      });

      if (streamCreatedEvent) {
        const parsed = readContract.interface.parseLog({
          topics: [...streamCreatedEvent.topics],
          data: streamCreatedEvent.data
        });
        streamId = parsed.args[0].toString();
        console.log('🔍 StreamCreated event found, stream ID:', streamId);
      }
    } catch (eventError) {
      console.error('Error parsing event:', eventError);
    }

    if (!streamId) {
      console.log('⚠️  Could not find StreamCreated event, using nextStreamId');
      const nextId = await readContract.nextStreamId();
      streamId = (Number(nextId) - 1).toString();
    }

    const block = await provider.getBlock(receipt.blockNumber);
    const startTime = block.timestamp;
    const endTime = startTime + parseInt(duration);

    const db = getDb();
    db.prepare(`
      INSERT INTO streams (
        stream_id, hr_id, employee_id, total_amount, 
        start_time, end_time, withdrawn_amount, active, paused, tx_hash
      ) VALUES (?, ?, ?, ?, ?, ?, 0, 1, 0, ?)
    `).run(
      streamId,
      hrId,
      employeeId,
      totalAmount,
      startTime,
      endTime,
      tx.hash
    );

    console.log('✅ Stream inserted into database:', streamId);
  } catch (error) {
    console.error('❌ Background confirmation error:', error);
  }
}

// Pause stream (HR only)
router.post('/:id/pause', authMiddleware, hrOnly, async (req, res) => {
  try {
    const streamId = req.params.id;
    const hrId = req.user.id;

    const db = getDb();
    const stream = db.prepare(`
      SELECT * FROM streams 
      WHERE stream_id = ? AND hr_id = ? AND active = 1
    `).get(streamId, hrId);

    if (!stream) {
      return res.status(404).json({ error: 'Stream not found or not active' });
    }

    const onChainStream = await readContract.getStream(streamId);
    if (onChainStream.paused) {
      return res.status(400).json({ error: 'Stream is already paused' });
    }

    console.log(`⏸️ Pausing stream ${streamId}`);

    const tx = await writeContract.pauseStream(streamId, {
      gasLimit: 200000
    });

    console.log('✅ Pause transaction sent:', tx.hash);

    res.json({
      success: true,
      txHash: tx.hash,
      status: 'pending',
      message: 'Stream pause transaction submitted',
      checkStatusUrl: `/api/streams/tx-status/${tx.hash}`
    });

    tx.wait().then(() => {
      console.log('✅ Stream paused confirmed');
      db.prepare(`
        UPDATE streams 
        SET paused = 1 
        WHERE stream_id = ?
      `).run(streamId);
    }).catch(err => {
      console.error('Pause confirmation failed:', err);
    });

  } catch (error) {
    console.error('Error pausing stream:', error);
    res.status(500).json({ 
      error: error.reason || error.message || 'Failed to pause stream'
    });
  }
});

// Resume stream (HR only)
router.post('/:id/resume', authMiddleware, hrOnly, async (req, res) => {
  try {
    const streamId = req.params.id;
    const hrId = req.user.id;

    const db = getDb();
    const stream = db.prepare(`
      SELECT * FROM streams 
      WHERE stream_id = ? AND hr_id = ? AND active = 1
    `).get(streamId, hrId);

    if (!stream) {
      return res.status(404).json({ error: 'Stream not found or not active' });
    }

    const onChainStream = await readContract.getStream(streamId);
    if (!onChainStream.paused) {
      return res.status(400).json({ error: 'Stream is not paused' });
    }

    console.log(`▶️ Resuming stream ${streamId}`);

    const tx = await writeContract.resumeStream(streamId, {
      gasLimit: 200000
    });

    console.log('✅ Resume transaction sent:', tx.hash);

    res.json({
      success: true,
      txHash: tx.hash,
      status: 'pending',
      message: 'Stream resume transaction submitted',
      checkStatusUrl: `/api/streams/tx-status/${tx.hash}`
    });

    tx.wait().then(() => {
      console.log('✅ Stream resumed confirmed');
      db.prepare(`
        UPDATE streams 
        SET paused = 0 
        WHERE stream_id = ?
      `).run(streamId);
    }).catch(err => {
      console.error('Resume confirmation failed:', err);
    });

  } catch (error) {
    console.error('Error resuming stream:', error);
    res.status(500).json({ 
      error: error.reason || error.message || 'Failed to resume stream'
    });
  }
});

// Cancel stream (HR only)
router.post('/:id/cancel', authMiddleware, hrOnly, async (req, res) => {
  try {
    const streamId = req.params.id;
    const hrId = req.user.id;

    const db = getDb();
    const stream = db.prepare(`
      SELECT * FROM streams 
      WHERE stream_id = ? AND hr_id = ? AND active = 1
    `).get(streamId, hrId);

    if (!stream) {
      return res.status(404).json({ error: 'Stream not found or not active' });
    }

    console.log(`🛑 Cancelling stream ${streamId}`);

    const tx = await writeContract.cancelStream(streamId);
    console.log('Cancel transaction sent:', tx.hash);

    res.json({
      success: true,
      txHash: tx.hash,
      status: 'pending',
      message: 'Cancel transaction submitted',
      checkStatusUrl: `/api/streams/tx-status/${tx.hash}`
    });

    tx.wait().then(() => {
      console.log('✅ Cancel confirmed');
      db.prepare(`
        UPDATE streams 
        SET active = 0 
        WHERE stream_id = ?
      `).run(streamId);
    }).catch(err => {
      console.error('Cancel confirmation failed:', err);
    });

  } catch (error) {
    console.error('Error cancelling stream:', error);
    res.status(500).json({ 
      error: error.reason || error.message || 'Failed to cancel stream'
    });
  }
});

// ── Claim / Withdraw salary (Employee only) ──
// The PayStream contract requires msg.sender == stream.employee, so the
// server wallet CANNOT sign this. Instead, we return the unsigned tx payload
// so the employee's frontend wallet can sign it with the correct chainId.
router.post('/:id/withdraw', authMiddleware, async (req, res) => {
  try {
    const streamId = req.params.id;
    const userId = req.user.id;

    // Only the employee whose stream this is can withdraw
    const db = getDb();
    const stream = db.prepare(`
      SELECT s.*, u.wallet_address as employeeWallet
      FROM streams s
      JOIN users u ON s.employee_id = u.id
      WHERE s.stream_id = ? AND s.employee_id = ?
    `).get(streamId, userId);

    if (!stream) {
      return res.status(404).json({ error: 'Stream not found or access denied' });
    }

    if (!stream.employeeWallet) {
      return res.status(400).json({ error: 'No wallet address linked to your account. Please set your wallet first.' });
    }

    // Validate stream state on-chain before sending tx data
    const onChainStream = await readContract.getStream(streamId);
    if (!onChainStream.active) {
      return res.status(400).json({ error: 'Stream is not active' });
    }
    if (onChainStream.paused) {
      return res.status(400).json({ error: 'Stream is currently paused' });
    }

    const available = await readContract.availableBalance(streamId);
    if (available === 0n) {
      return res.status(400).json({ error: 'No balance available to claim yet' });
    }

    // Build the unsigned transaction for the frontend wallet to sign.
    // Explicitly include chainId: 666888 so MetaMask / any wallet never
    // mismatches the network.
    const iface = new ethers.Interface([
      'function withdraw(uint256 streamId)'
    ]);
    const data = iface.encodeFunctionData('withdraw', [BigInt(streamId)]);

    const feeData = await provider.getFeeData();

    res.json({
      success: true,
      message: 'Sign and submit this transaction from your wallet',
      availableBalance: ethers.formatEther(available),
      // Unsigned tx — frontend submits this via eth_sendTransaction
      unsignedTx: {
        to: process.env.PAYSTREAM_CONTRACT,
        data,
        chainId: 666888,           // ← explicit chainId fix
        gasLimit: '0x493E0',       // 300 000 gas
        maxFeePerGas: feeData.maxFeePerGas
          ? '0x' + feeData.maxFeePerGas.toString(16)
          : undefined,
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas
          ? '0x' + feeData.maxPriorityFeePerGas.toString(16)
          : undefined,
        from: stream.employeeWallet,
      },
      // Also return raw values so the frontend can construct the tx itself
      contractAddress: process.env.PAYSTREAM_CONTRACT,
      streamId,
      chainId: 666888,
      rpcUrl: process.env.HELA_RPC_URL || 'https://testnet-rpc.helachain.com',
    });
  } catch (error) {
    console.error('Error preparing withdraw:', error);
    res.status(500).json({ error: error.reason || error.message || 'Failed to prepare withdraw' });
  }
});

// ── Notify backend after successful on-chain withdrawal ──
// Frontend calls this AFTER the tx is confirmed so the DB stays in sync.
router.post('/:id/withdraw-confirm', authMiddleware, async (req, res) => {
  try {
    const streamId = req.params.id;
    const { txHash } = req.body;
    const userId = req.user.id;

    if (!txHash) {
      return res.status(400).json({ error: 'txHash required' });
    }

    const db = getDb();
    const stream = db.prepare(
      'SELECT * FROM streams WHERE stream_id = ? AND employee_id = ?'
    ).get(streamId, userId);

    if (!stream) {
      return res.status(404).json({ error: 'Stream not found' });
    }

    // Pull latest withdrawn amount from chain
    const onChainStream = await readContract.getStream(streamId);
    const withdrawnAmount = ethers.formatEther(onChainStream.withdrawnAmount);

    db.prepare(
      'UPDATE streams SET withdrawn_amount = ? WHERE stream_id = ?'
    ).run(withdrawnAmount, streamId);

    res.json({
      success: true,
      txHash,
      withdrawnAmount,
      message: 'Withdrawal recorded',
    });
  } catch (error) {
    console.error('Error confirming withdraw:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single stream details
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const streamId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;

    const db = getDb();
    let stream;

    if (userRole === 'hr') {
      stream = db.prepare(`
        SELECT s.*, u.name as employeeName, u.email as employeeEmail
        FROM streams s
        JOIN users u ON s.employee_id = u.id
        WHERE s.stream_id = ? AND s.hr_id = ?
      `).get(streamId, userId);
    } else {
      stream = db.prepare(`
        SELECT s.*, u.name as employerName, u.email as employerEmail
        FROM streams s
        JOIN users u ON s.hr_id = u.id
        WHERE s.stream_id = ? AND s.employee_id = ?
      `).get(streamId, userId);
    }

    if (!stream) {
      return res.status(404).json({ error: 'Stream not found' });
    }

    const onChainStream = await readContract.getStream(streamId);
    const availableBalance = await readContract.availableBalance(streamId);

    const streamData = {
      ...stream,
      active: onChainStream.active,
      paused: onChainStream.paused,
      withdrawnAmount: ethers.formatEther(onChainStream.withdrawnAmount),
      availableBalance: ethers.formatEther(availableBalance),
      ratePerSecond: ethers.formatEther(onChainStream.ratePerSecond),
      pausedTime: Number(onChainStream.pausedTime),
      totalPausedDuration: Number(onChainStream.totalPausedDuration)
    };

    res.json({ stream: streamData });
  } catch (error) {
    console.error('Error fetching stream:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;