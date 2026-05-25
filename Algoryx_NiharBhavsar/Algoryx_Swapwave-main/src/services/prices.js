const COINGECKO_IDS = {
  ETH:  'ethereum',
  USDC: 'usd-coin',
  USDT: 'tether',
  DAI:  'dai',
  WBTC: 'wrapped-bitcoin',
}

export async function fetchPrices(tokens) {
  try {
    const ids = tokens
      .map(t => COINGECKO_IDS[t])
      .filter(Boolean)
      .join(',')

    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`,
      { headers: { 'Accept': 'application/json' } }
    )

    if (!res.ok) throw new Error('CoinGecko fetch failed')

    const data = await res.json()

    // Remap back to token symbols
    const result = {}
    for (const token of tokens) {
      const id = COINGECKO_IDS[token]
      if (id && data[id]?.usd) {
        result[token] = data[id].usd
      }
    }
    return result
  } catch (err) {
    console.warn('fetchPrices failed:', err.message)
    // Fallback static prices so app never crashes
    return {
      ETH:  2350,
      USDC: 1,
      USDT: 1,
      DAI:  1,
      WBTC: 67000,
    }
  }
}