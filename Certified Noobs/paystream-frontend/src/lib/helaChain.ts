export const HELA_CHAIN_ID = 666888;
export const HELA_RPC_URL = "https://testnet-rpc.helachain.com";
export const HELA_BLOCK_EXPLORER = "https://testnet-blockexplorer.helachain.com";

export function getExplorerTxUrl(txHash: string): string {
  return `${HELA_BLOCK_EXPLORER}/tx/${txHash}`;
}

export function getExplorerAddressUrl(address: string): string {
  return `${HELA_BLOCK_EXPLORER}/address/${address}`;
}
