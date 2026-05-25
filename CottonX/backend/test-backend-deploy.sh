#!/bin/bash

echo "Testing Backend Deployment Endpoint"
echo "===================================="
echo ""

# Check if server is running
echo "1. Checking if server is running..."
curl -s http://localhost:8080/health > /dev/null
if [ $? -ne 0 ]; then
    echo "❌ Server is not running!"
    echo "Please start it with: npm run dev"
    exit 1
fi
echo "✅ Server is running"
echo ""

# Upload a simple contract
echo "2. Uploading test contract..."
UPLOAD_RESPONSE=$(curl -s -X POST http://localhost:8080/api/contracts/upload \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test_user_123",
    "fileName": "Test.sol",
    "sourceCode": "// SPDX-License-Identifier: MIT\npragma solidity ^0.8.0;\n\ncontract Test {\n    uint256 public value = 42;\n}",
    "contractName": "Test"
  }')

echo "$UPLOAD_RESPONSE" | jq '.'

FILE_ID=$(echo "$UPLOAD_RESPONSE" | jq -r '.data.fileId')

if [ "$FILE_ID" == "null" ] || [ -z "$FILE_ID" ]; then
    echo "❌ Upload failed!"
    exit 1
fi

echo "✅ Contract uploaded with fileId: $FILE_ID"
echo ""

# Deploy the contract
echo "3. Deploying contract..."
DEPLOY_RESPONSE=$(curl -s -X POST http://localhost:8080/api/contracts/deploy \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": \"test_user_123\",
    \"fileId\": \"$FILE_ID\",
    \"constructorArgs\": [],
    \"userAddress\": \"0x0000000000000000000000000000000000000000\"
  }")

echo "$DEPLOY_RESPONSE" | jq '.'

CONTRACT_ADDRESS=$(echo "$DEPLOY_RESPONSE" | jq -r '.data.contractAddress')

if [ "$CONTRACT_ADDRESS" == "null" ] || [ -z "$CONTRACT_ADDRESS" ]; then
    echo "❌ Deployment failed!"
    exit 1
fi

echo ""
echo "✅ Contract deployed at: $CONTRACT_ADDRESS"
echo "🎉 All tests passed!"
