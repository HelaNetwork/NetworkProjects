import { TOKEN_ADDRESSES, toSmallestUnit, TOKEN_DECIMALS } from '../config/tokens.js'

const BASE_URL = 'https://apiv5.paraswap.io'

export async function getParaswapQuote(fromToken, toToken, amount) {
  const srcToken = TOKEN_ADDRESSES[fromToken]
  const destToken = TOKEN_ADDRESSES[toToken]
  const srcDecimals = TOKEN_DECIMALS[fromToken] || 18
  const destDecimals = TOKEN_DECIMALS[toToken] || 18
  const amountWei = toSmallestUnit(amount, fromToken)

  const url = BASE_URL + '/prices?srcToken=' + srcToken + '&destToken=' + destToken +
    '&amount=' + amountWei + '&srcDecimals=' + srcDecimals +
    '&destDecimals=' + destDecimals + '&side=SELL&network=1'

  const response = await fetch(url)
  if (!response.ok) throw new Error('Paraswap failed: ' + response.status)

  const data = await response.json()
  const bestRoute = data.priceRoute
  return {
    source: 'Paraswap',
    toAmount: bestRoute.destAmount,
    toAmountHuman: formatAmount(bestRoute.destAmount, toToken),
    gas: bestRoute.gasCost,
    estimatedPriceImpact: bestRoute.percentChange || null,
    raw: data,
  }
}

function formatAmount(rawAmount, token) {
  const decimals = (token === 'USDC' || token === 'USDT') ? 6 : 18
  return (Number(rawAmount) / 10 ** decimals).toFixed(4)
}