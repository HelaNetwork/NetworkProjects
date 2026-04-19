export async function getGasPrice() {
  try {
    const res  = await fetch('https://api.etherscan.io/api?module=gastracker&action=gasoracle')
    const data = await res.json()
    if (data.result?.ProposeGasPrice) return data.result.ProposeGasPrice
    throw new Error('no data')
  } catch {
    return '24'
  }
}