import { TOKEN_ADDRESSES, toSmallestUnit, TOKEN_DECIMALS } from '../config/tokens.js'

const BASE_URL = 'https://open-api.openocean.finance/v3/eth'

export async function getOpenOceanQuote(fromToken, toToken, amount) {
  const inTokenAddress = TOKEN_ADDRESSES[fromToken]
  const outTokenAddress = TOKEN_ADDRESSES[toToken]
  const inDecimals = TOKEN_DECIMALS[fromToken] || 18
  const outDecimals = TOKEN_DECIMALS[toToken] || 18

  const url = `${BASE_URL}/quote?inTokenAddress=${inTokenAddress}&outTokenAddress=${outTokenAddress}&amount=${amount}&gasPrice=5&slippage=1`

  const response = await fetch(url)
  if (!response.ok) throw new Error('OpenOcean failed: ' + response.status)
  const data = await response.json()
  if (!data.data) throw new Error('No OpenOcean quote')

  const toAmountHuman = (Number(data.data.outAmount) / 10 ** outDecimals).toFixed(4)

  return {
    source: 'OpenOcean',
    toAmount: String(Math.floor(Number(data.data.outAmount))),
    toAmountHuman,
    gas: data.data.estimatedGas,
    estimatedPriceImpact: data.data.price_impact || null,
    raw: data,
  }
}