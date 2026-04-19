param(
    [Parameter(Mandatory = $true)]
    [string]$ContractFolder,
    [Parameter(Mandatory = $true)]
    [string]$SoName,
    [string]$EnvKey,
    [string]$RpcUrl = "https://api.devnet.solana.com"
)

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendRoot = Resolve-Path (Join-Path $scriptDir "..")
$contractDir = Join-Path $backendRoot ("contracts\" + $ContractFolder)
$solanaConfigDir = Join-Path $env:USERPROFILE ".config\solana"
$solanaKeypairPath = Join-Path $solanaConfigDir "id.json"
$envPath = Join-Path $backendRoot ".env"
$image = "solanalabs/solana:v1.18.26"
$soPath = "/work/target/deploy/$SoName.so"

if (!(Test-Path $contractDir)) {
    throw "Contract folder not found: $contractDir"
}

if (!(Test-Path $solanaConfigDir)) {
    New-Item -ItemType Directory -Path $solanaConfigDir -Force | Out-Null
}

if (!(Test-Path $solanaKeypairPath)) {
    Write-Host "No Solana keypair found. Creating one in $solanaKeypairPath ..."
    docker run --rm -v "${solanaConfigDir}:/root/.config/solana" $image solana-keygen new --no-bip39-passphrase -o /root/.config/solana/id.json | Out-Null
}

Write-Host "Building program in Docker for $ContractFolder ..."
docker run --rm -v "${contractDir}:/work" $image bash -lc "cd /work && cargo build-sbf"

Write-Host "Requesting devnet airdrop for deploy wallet..."
docker run --rm -v "${solanaConfigDir}:/root/.config/solana" $image bash -lc "solana config set --url $RpcUrl --keypair /root/.config/solana/id.json >/dev/null && solana airdrop 2 || true && solana balance"

Write-Host "Deploying $SoName to devnet..."
$deployOutput = docker run --rm -v "${solanaConfigDir}:/root/.config/solana" -v "${contractDir}:/work" $image bash -lc "solana config set --url $RpcUrl --keypair /root/.config/solana/id.json >/dev/null && solana program deploy $soPath"
$deployOutputText = ($deployOutput | Out-String).Trim()
$programId = ""

if ($deployOutputText -match "Program Id:\s*([1-9A-HJ-NP-Za-km-z]{32,44})") {
    $programId = $matches[1]
}

if (-not $programId) {
    Write-Host $deployOutputText
    throw "Could not detect Program Id from deploy output"
}

Write-Host "Program deployed: $programId"

if ($EnvKey) {
    if (!(Test-Path $envPath)) {
        throw ".env file not found at $envPath"
    }

    $envContent = Get-Content -Raw -Path $envPath
    if ($envContent -match "(?m)^$EnvKey=") {
        $envContent = [Regex]::Replace($envContent, "(?m)^$EnvKey=.*$", "$EnvKey=$programId")
    }
    else {
        $envContent = $envContent.TrimEnd() + "`r`n$EnvKey=$programId`r`n"
    }

    Set-Content -Path $envPath -Value $envContent -NoNewline
    Write-Host "Updated .env $EnvKey"
}

Write-Host "Done. Program Id: $programId"
