#!/bin/bash

echo "🚀 REDEPLOYING CONTRACTS ON CHAIN ID 666888"
echo "============================================"
echo ""

# Navigate to backend
cd backend

echo "1️⃣ Checking network configuration..."
echo "Chain ID should be: 666888"
echo ""

echo "2️⃣ Deploying contracts..."
npx hardhat run scripts/deploy.js --network helaTestnet

echo ""
echo "3️⃣ Reading new contract addresses..."
if [ -f deployed-addresses.json ]; then
    PAYSTREAM=$(cat deployed-addresses.json | grep -o '"paystreamContract": "[^"]*' | cut -d'"' -f4)
    HLUSD=$(cat deployed-addresses.json | grep -o '"hlusdToken": "[^"]*' | cut -d'"' -f4)
    
    echo ""
    echo "✅ NEW CONTRACT ADDRESSES:"
    echo "PAYSTREAM_CONTRACT=$PAYSTREAM"
    echo "HLUSD_TOKEN=$HLUSD"
    echo ""
    
    echo "4️⃣ Updating .env file..."
    # Backup old .env
    cp .env .env.backup
    
    # Update .env
    sed -i "s|PAYSTREAM_CONTRACT=.*|PAYSTREAM_CONTRACT=$PAYSTREAM|g" .env
    sed -i "s|HLUSD_TOKEN=.*|HLUSD_TOKEN=$HLUSD|g" .env
    
    echo "✅ .env updated!"
    echo ""
    
    echo "5️⃣ Updating frontend .env..."
    if [ -f ../frontend/.env ]; then
        sed -i "s|VITE_PAYSTREAM_CONTRACT=.*|VITE_PAYSTREAM_CONTRACT=$PAYSTREAM|g" ../frontend/.env
        echo "✅ Frontend .env updated!"
    else
        echo "VITE_API_URL=http://localhost:4000" > ../frontend/.env
        echo "VITE_PAYSTREAM_CONTRACT=$PAYSTREAM" >> ../frontend/.env
        echo "✅ Frontend .env created!"
    fi
    
    echo ""
    echo "============================================"
    echo "✅ DEPLOYMENT COMPLETE!"
    echo "============================================"
    echo ""
    echo "📋 NEXT STEPS:"
    echo "1. Restart backend: cd backend && npm restart"
    echo "2. Restart frontend: cd frontend && npm run dev"
    echo "3. Refresh browser and try again!"
    echo ""
else
    echo "❌ Error: deployed-addresses.json not found"
    echo "Please check deployment logs above for errors"
fi
