param(
    [string]$RpcUrl = "https://api.devnet.solana.com"
)

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
& (Join-Path $scriptDir "deploy-solana-program-devnet.ps1") `
    -ContractFolder "bonding-curve-market" `
    -SoName "bonding_curve_market" `
    -EnvKey "BONDING_CURVE_PROGRAM_ID" `
    -RpcUrl $RpcUrl
