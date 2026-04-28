const BASE_URL = 'https://api.coingecko.com/api/v3'

const COINGECKO_IDS = {
  ETH: 'ethereum', USDC: 'usd-coin', USDT: 'tether',
  DAI: 'dai', WBTC: 'wrapped-bitcoin', LINK: 'chainlink',
  UNI: 'uniswap', AAVE: 'aave', MATIC: 'matic-network', SHIB: 'shiba-inu',
}

export async function getMultiplePrices(tokenSymbols) {
  const ids = tokenSymbols.map(s => COINGECKO_IDS[s]).filter(Boolean).join(',')
  if (!ids) return {}
  const response = await fetch(BASE_URL + '/simple/price?ids=' + ids + '&vs_currencies=usd')
  const data = await response.json()
  const result = {}
  for (const symbol of tokenSymbols) {
    result[symbol] = data[COINGECKO_IDS[symbol]]?.usd || null
  }
  return result
}

export async function getTokenChart(tokenSymbol) {
  const id = COINGECKO_IDS[tokenSymbol]
  if (!id) return []
  const response = await fetch(BASE_URL + '/coins/' + id + '/market_chart?vs_currency=usd&days=7')
  if (!response.ok) return []
  const data = await response.json()
  return (data.prices || []).map(([timestamp, price]) => ({
    time: new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    price: parseFloat(price.toFixed(2)),
  }))
}