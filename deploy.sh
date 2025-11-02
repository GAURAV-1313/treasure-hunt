#!/bin/bash

# Treasure Hunt Deployment Script for Stellar Testnet
echo "🚀 Starting Treasure Hunt Deployment..."

# Configuration
NETWORK="testnet"
IDENTITY="treasure-admin"

# Step 1: Build the contract
echo "📦 Building contract..."
stellar contract build

# Check if build was successful
if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Build successful!"

# Step 2: Generate identity if it doesn't exist
echo "🔑 Setting up identity..."
stellar keys generate $IDENTITY --network $NETWORK 2>/dev/null || echo "Identity already exists"

# Get the address
ADMIN_ADDRESS=$(stellar keys address $IDENTITY)
echo "Admin address: $ADMIN_ADDRESS"

# Step 3: Fund the account on testnet
echo "💰 Funding admin account..."
curl -X POST "https://friendbot.stellar.org?addr=$ADMIN_ADDRESS"
sleep 3

# Step 4: Deploy the contract
echo "🚀 Deploying contract to testnet..."
CONTRACT_ID=$(stellar contract deploy \
    --wasm target/wasm32v1-none/release/treasure_hunt.wasm \
    --source $IDENTITY \
    --network $NETWORK)

if [ $? -ne 0 ]; then
    echo "❌ Deployment failed!"
    exit 1
fi

echo "✅ Contract deployed successfully!"
echo "📝 Contract ID: $CONTRACT_ID"

# Step 5: Initialize the contract
echo "🔧 Initializing contract..."
stellar contract invoke \
    --id $CONTRACT_ID \
    --source $IDENTITY \
    --network $NETWORK \
    -- \
    initialize \
    --admin $ADMIN_ADDRESS

echo "✅ Contract initialized!"

# Step 6: Create sample treasure hunts
echo "🎮 Creating sample treasure hunts..."

# Hunt 1: Stellar Knowledge
stellar contract invoke \
    --id $CONTRACT_ID \
    --source $IDENTITY \
    --network $NETWORK \
    -- \
    create_hunt \
    --admin $ADMIN_ADDRESS \
    --id 1 \
    --name "Stellar Origins" \
    --answer_hash "stellar" \
    --reward_amount 100

# Hunt 2: Blockchain Basics
stellar contract invoke \
    --id $CONTRACT_ID \
    --source $IDENTITY \
    --network $NETWORK \
    -- \
    create_hunt \
    --admin $IDENTITY \
    --id 2 \
    --name "Soroban Power" \
    --answer_hash "soroban" \
    --reward_amount 200

echo "✅ Sample hunts created!"

# Save contract info to file
cat > contract-info.json << EOF
{
  "contractId": "$CONTRACT_ID",
  "network": "$NETWORK",
  "adminAddress": "$ADMIN_ADDRESS",
  "adminIdentity": "$IDENTITY",
  "deployedAt": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
}
EOF

echo ""
echo "=========================================="
echo "🎉 DEPLOYMENT COMPLETE!"
echo "=========================================="
echo "Contract ID: $CONTRACT_ID"
echo "Network: $NETWORK"
echo "Admin: $ADMIN_ADDRESS"
echo ""
echo "Contract info saved to: contract-info.json"
echo ""
echo "Next steps:"
echo "1. Copy the CONTRACT_ID to your frontend .env file"
echo "2. Run: npm install"
echo "3. Run: npm run dev"
echo "=========================================="