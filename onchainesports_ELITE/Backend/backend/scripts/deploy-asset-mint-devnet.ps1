param(
    [string]$RpcUrl = "https://api.devnet.solana.com"
)

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
& (Join-Path $scriptDir "deploy-solana-program-devnet.ps1") `
    -ContractFolder "asset-mint-program" `
    -SoName "asset_mint_program" `
    -EnvKey "ASSET_MINT_PROGRAM_ID" `
    -RpcUrl $RpcUrl
