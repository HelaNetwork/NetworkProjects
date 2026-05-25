import { TOKEN_ADDRESSES, toSmallestUnit, TOKEN_DECIMALS } from '../config/tokens.js'

const BASE_URL = 'https://aggregator-api.kyberswap.com/ethereum/api/v1'

export async function getKyberQuote(fromToken, toToken, amount) {
  const srcToken = TOKEN_ADDRESSES[fromToken]
  const dstToken = TOKEN_ADDRESSES[toToken]
  const amountIn = toSmallestUnit(amount, fromToken)

  const url = `${BASE_URL}/routes?tokenIn=${srcToken}&tokenOut=${dstToken}&amountIn=${amountIn}`
  const response = await fetch(url, {
    headers: { 'x-client-id': 'swapwave' }
  })
  if (!response.ok) throw new Error('KyberSwap failed: ' + response.status)
  const data = await response.json()
  const route = data.data?.routeSummary
  if (!route) throw new Error('No KyberSwap route found')

  const decimals = TOKEN_DECIMALS[toToken] || 18
  const toAmountHuman = (Number(route.amountOut) / 10 ** decimals).toFixed(4)

  return {
    source: 'KyberSwap',
    toAmount: route.amountOut,
    toAmountHuman,
    gas: route.estimatedGas,
    estimatedPriceImpact: route.priceImpact || null,
    routePath: route.route || [],
    raw: data,
  }
}