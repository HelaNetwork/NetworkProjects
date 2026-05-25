export const TOKEN_ADDRESSES = {
  ETH:  '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
  USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  DAI:  '0x6B175474E89094C44Da98b954EedeAC495271d0F',
  WBTC: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
}

export const TOKEN_DECIMALS = {
  ETH:  18,
  USDC: 6,
  USDT: 6,
  DAI:  18,
  WBTC: 8,
}

export function toSmallestUnit(amount, token) {
  const decimals = TOKEN_DECIMALS[token] ?? 18
  const factor   = BigInt(10) ** BigInt(decimals)
  const [whole, frac = ''] = String(amount).split('.')
  const fracPadded = frac.padEnd(decimals, '0').slice(0, decimals)
  return (BigInt(whole) * factor + BigInt(fracPadded || '0')).toString()
}