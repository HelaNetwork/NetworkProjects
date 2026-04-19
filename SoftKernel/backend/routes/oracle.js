import { Router } from 'express';
import { ethers } from 'ethers';

const router = Router();

const ORACLE_PRIVATE_KEY = process.env.ORACLE_PRIVATE_KEY;
const RATE_VALIDITY = 300; // 5 minutes

/**
 * GET /api/oracle/signed-rate
 * Fetches live HLUSD→INR rate from CoinGecko and returns it with
 * the oracle's ECDSA signature. The private key never leaves the server.
 */
router.get('/signed-rate', async (req, res) => {
  try {
    if (!ORACLE_PRIVATE_KEY) {
      return res.status(500).json({ success: false, error: 'Oracle not configured' });
    }

    // Fetch live rate from CoinGecko
    let hlusdToInr;
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=hela-usd&vs_currencies=inr'
      );
      if (!response.ok) throw new Error('CoinGecko API error');
      const data = await response.json();
      hlusdToInr = data['hela-usd']?.inr || 83;
    } catch {
      // Fallback rate for development
      hlusdToInr = 83;
    }

    const timestamp = Math.floor(Date.now() / 1000);

    // Scale rate to 18 decimals for the contract
    const scaledRate = BigInt(Math.floor(hlusdToInr * 1e18));
    const timestampBigInt = BigInt(timestamp);

    // Create the same hash the contract uses in _hashRate
    const messageHash = ethers.solidityPackedKeccak256(
      ['uint256', 'uint256'],
      [scaledRate, timestampBigInt]
    );

    // Sign with oracle key
    const oracleWallet = new ethers.Wallet(ORACLE_PRIVATE_KEY);
    const signature = await oracleWallet.signMessage(ethers.getBytes(messageHash));

    res.json({
      success: true,
      rate: scaledRate.toString(),
      timestamp: timestamp,
      signature,
      compositeRate: hlusdToInr,
      hlusdToInr,
      validFor: RATE_VALIDITY,
    });
  } catch (err) {
    console.error('Oracle signing error:', err);
    res.status(500).json({ success: false, error: 'Failed to generate signed rate' });
  }
});

export default router;
