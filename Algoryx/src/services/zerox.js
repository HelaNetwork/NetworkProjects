import { TOKEN_ADDRESSES, toSmallestUnit } from '../config/tokens.js'

const BASE_URL = 'https://api.0x.org/swap/v1'
const API_KEY = import.meta.env.VITE_ZEROX_KEY

export async function get0xQuote(fromToken, toToken, amount) {
  const sellToken = TOKEN_ADDRESSES[fromToken]
  const buyToken = TOKEN_ADDRESSES[toToken]
  const sellAmount = toSmallestUnit(amount, fromToken)
  const url = BASE_URL + '/quote?sellToken=' + sellToken + '&buyToken=' + buyToken + '&sellAmount=' + sellAmount

  const response = await fetch(url, { headers: { '0x-api-key': API_KEY } })
  if (!response.ok) {
    const err = await response.json()
    throw new Error('0x failed: ' + (err.reason || response.status))
  }
  const data = await response.json()
  return {
    source: '0x',
    toAmount: data.buyAmount,
    toAmountHuman: formatAmount(data.buyAmount, toToken),
    gas: data.estimatedGas,
    estimatedPriceImpact: data.estimatedPriceImpact || null,
    raw: data,
  }
}

function formatAmount(rawAmount, token) {
  const decimals = (token === 'USDC' || token === 'USDT') ? 6 : 18
  return (Number(rawAmount) / 10 ** decimals).toFixed(4)
}