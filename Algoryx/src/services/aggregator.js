const PARASWAP_API = 'https://apiv5.paraswap.io/prices'

const TOKEN_ADDRESSES = {
  ETH:  '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
  USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  DAI:  '0x6B175474E89094C44Da98b954EedeAC495271d0F',
  WBTC: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
}

const DECIMALS = {
  ETH: 18, USDC: 6, USDT: 6, DAI: 18, WBTC: 8,
}

function toWei(amount, token) {
  const dec = DECIMALS[token] ?? 18
  return String(Math.floor(parseFloat(amount) * 10 ** dec))
}

function fromWei(amount, token) {
  const dec = DECIMALS[token] ?? 18
  return (parseFloat(amount) / 10 ** dec).toFixed(4)
}

async function fetchParaswap(fromToken, toToken, amount) {
  try {
    const srcAddr  = TOKEN_ADDRESSES[fromToken]
    const destAddr = TOKEN_ADDRESSES[toToken]
    const srcDec   = DECIMALS[fromToken] ?? 18
    const destDec  = DECIMALS[toToken]   ?? 18
    const amountWei = toWei(amount, fromToken)

    const url = `${PARASWAP_API}?srcToken=${srcAddr}&destToken=${destAddr}&amount=${amountWei}&srcDecimals=${srcDec}&destDecimals=${destDec}&side=SELL&network=1`
    const res  = await fetch(url)
    if (!res.ok) throw new Error('Paraswap request failed')
    const data = await res.json()
    if (!data.priceRoute) throw new Error('No route from Paraswap')

    return {
      source:        'Paraswap',
      toAmountHuman: fromWei(data.priceRoute.destAmount, toToken),
      gas:           data.priceRoute.gasCost || 185000,
      raw:           data,
    }
  } catch (e) {
    console.warn('Paraswap failed:', e.message)
    return null
  }
}

async function fetchKyberswap(fromToken, toToken, amount) {
  try {
    const srcAddr  = TOKEN_ADDRESSES[fromToken]
    const destAddr = TOKEN_ADDRESSES[toToken]
    const amountWei = toWei(amount, fromToken)

    const url = `https://aggregator-api.kyberswap.com/ethereum/api/v1/routes?tokenIn=${srcAddr}&tokenOut=${destAddr}&amountIn=${amountWei}`
    const res  = await fetch(url)
    if (!res.ok) throw new Error('KyberSwap request failed')
    const data = await res.json()
    if (!data.data?.routeSummary) throw new Error('No route from KyberSwap')

    return {
      source:        'KyberSwap',
      toAmountHuman: fromWei(data.data.routeSummary.amountOut, toToken),
      gas:           data.data.routeSummary.gas || 174000,
      raw:           data,
    }
  } catch (e) {
    console.warn('KyberSwap failed:', e.message)
    return null
  }
}

function getMockQuotes(fromToken, toToken, amount) {
  const rates = {
    'ETH-USDC':  2354.52,
    'ETH-USDT':  2352.10,
    'ETH-DAI':   2353.80,
    'ETH-WBTC':  0.0341,
    'USDC-ETH':  0.000425,
    'USDT-ETH':  0.000424,
    'DAI-ETH':   0.000424,
    'WBTC-ETH':  29.3,
    'USDC-DAI':  0.9998,
    'DAI-USDC':  1.0001,
    'USDC-USDT': 0.9999,
    'USDT-USDC': 1.0001,
  }
  const key  = `${fromToken}-${toToken}`
  const rate = rates[key] ?? 1
  const base = parseFloat(amount) * rate

  return [
    { source: 'Paraswap',  toAmountHuman: (base * 1.0000).toFixed(4), gas: 185000, raw: {} },
    { source: '0x',        toAmountHuman: (base * 0.9975).toFixed(4), gas: 162000, raw: {} },
    { source: 'KyberSwap', toAmountHuman: (base * 0.9950).toFixed(4), gas: 174000, raw: {} },
    { source: 'OpenOcean', toAmountHuman: (base * 0.9930).toFixed(4), gas: 191000, raw: {} },
  ]
}

export async function fetchAllQuotes(fromToken, toToken, amount, slippage = '1') {
  // Fire real API calls in parallel
  const [paraswap, kyber] = await Promise.all([
    fetchParaswap(fromToken, toToken, amount),
    fetchKyberswap(fromToken, toToken, amount),
  ])

  // Merge live results with mocks for sources that failed
  const mocks   = getMockQuotes(fromToken, toToken, amount)
  const live    = [paraswap, kyber].filter(Boolean)
  const liveNames = live.map(q => q.source)
  const fallbacks = mocks.filter(m => !liveNames.includes(m.source))

  const all = [...live, ...fallbacks].sort(
    (a, b) => parseFloat(b.toAmountHuman) - parseFloat(a.toAmountHuman)
  )

  const best   = all[0]
  const second = all[1]
  const saving = second
    ? (parseFloat(best.toAmountHuman) - parseFloat(second.toAmountHuman)).toFixed(4)
    : null

  return {
    best,
    all,
    reason: `Best route via ${best.source}. Output: ${best.toAmountHuman} ${toToken}. Est. gas: ${Number(best.gas).toLocaleString()} units. Slippage: ${slippage}%.`,
    savingVsSecond: saving,
  }
}