import { Router } from 'express';

const router = Router();

// In-memory cache to avoid hammering CoinGecko
let cachedPrices = { usd: 1, inr: 83.5, hlusdToInr: 83 };
let lastFetch = 0;
const CACHE_MS = 60_000; // 60 seconds

/**
 * GET /api/prices
 * Server-side proxy for CoinGecko price data.
 * Avoids CORS issues and rate-limiting from the browser.
 */
router.get('/', async (_req, res) => {
  try {
    const now = Date.now();

    if (now - lastFetch < CACHE_MS) {
      return res.json({ success: true, ...cachedPrices, cached: true });
    }

    // Fetch both ETH and HLUSD prices in parallel
    const [ethRes, hlusdRes] = await Promise.allSettled([
      fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd,inr'),
      fetch('https://api.coingecko.com/api/v3/simple/price?ids=hela-usd&vs_currencies=inr'),
    ]);

    // ETH prices (used by priceUtils)
    if (ethRes.status === 'fulfilled' && ethRes.value.ok) {
      try {
        const data = await ethRes.value.json();
        if (data?.ethereum) {
          cachedPrices.usd = 1; // HLUSD pegged ~1 USD
          cachedPrices.inr = 83.5; // Stable INR reference
        }
      } catch { /* use cached */ }
    }

    // HLUSD → INR (used by offRampService)
    if (hlusdRes.status === 'fulfilled' && hlusdRes.value.ok) {
      try {
        const data = await hlusdRes.value.json();
        cachedPrices.hlusdToInr = data['hela-usd']?.inr || 83;
      } catch { /* use cached */ }
    }

    lastFetch = now;
    res.json({ success: true, ...cachedPrices, cached: false });
  } catch (err) {
    console.error('Price proxy error:', err);
    // Return cached/fallback prices even on error
    res.json({ success: true, ...cachedPrices, cached: true });
  }
});

export default router;
