# Test Backend Deployment Endpoint

Write-Host "Testing Backend Deployment Endpoint" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# Check if server is running
Write-Host "1. Checking if server is running..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:8080/health" -Method Get
    Write-Host "✅ Server is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Server is not running!" -ForegroundColor Red
    Write-Host "Please start it with: npm run dev" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Upload a simple contract
Write-Host "2. Uploading test contract..." -ForegroundColor Yellow
$uploadBody = @{
    userId = "test_user_123"
    fileName = "Test.sol"
    sourceCode = @"
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Test {
    uint256 public value = 42;
}
"@
    contractName = "Test"
} | ConvertTo-Json

try {
    $uploadResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/contracts/upload" `
        -Method Post `
        -ContentType "application/json" `
        -Body $uploadBody
    
    Write-Host ($uploadResponse | ConvertTo-Json -Depth 10)
    $fileId = $uploadResponse.data.fileId
    Write-Host "✅ Contract uploaded with fileId: $fileId" -ForegroundColor Green
} catch {
    Write-Host "❌ Upload failed!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}
Write-Host ""

# Deploy the contract
Write-Host "3. Deploying contract..." -ForegroundColor Yellow
$deployBody = @{
    userId = "test_user_123"
    fileId = $fileId
    constructorArgs = @()
    userAddress = "0x0000000000000000000000000000000000000000"
} | ConvertTo-Json

try {
    $deployResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/contracts/deploy" `
        -Method Post `
        -ContentType "application/json" `
        -Body $deployBody
    
    Write-Host ($deployResponse | ConvertTo-Json -Depth 10)
    $contractAddress = $deployResponse.data.contractAddress
    Write-Host ""
    Write-Host "✅ Contract deployed at: $contractAddress" -ForegroundColor Green
    Write-Host "🎉 All tests passed!" -ForegroundColor Green
} catch {
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host $_.Exception.Response -ForegroundColor Red
    exit 1
}
