param(
    [string]$RpcUrl = "https://api.devnet.solana.com"
)

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
& (Join-Path $scriptDir "deploy-solana-program-devnet.ps1") `
    -ContractFolder "prediction-market" `
    -SoName "prediction_market" `
    -EnvKey "PREDICTION_MARKET_PROGRAM_ID" `
    -RpcUrl $RpcUrl
