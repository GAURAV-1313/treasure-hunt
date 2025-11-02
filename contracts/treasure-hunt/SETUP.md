# 🏴‍☠️ Virtual Treasure Hunt - Complete Setup Guide

## 📋 Prerequisites

Before you start, make sure you have:

- ✅ **Rust & Cargo** installed ([rustup.rs](https://rustup.rs/))
- ✅ **Node.js 18+** and npm
- ✅ **Stellar CLI** installed
- ✅ **Freighter Wallet** browser extension
- ✅ Git

### Install Stellar CLI

```bash
cargo install --locked stellar-cli --features opt
```

Verify installation:
```bash
stellar --version
```

### Install Freighter Wallet

Download from: https://www.freighter.app/

## 🚀 Quick Start (6-Hour Timeline)

### Hour 0: Pre-Setup (Do this BEFORE the hackathon!)

```bash
# 1. Clone/create project structure
mkdir treasure-hunt && cd treasure-hunt

# 2. Initialize Soroban contract
stellar contract init treasure-hunt

# 3. Create frontend directory
npm create vite@latest frontend -- --template react-ts
cd frontend && npm install
cd ..
```

---

## 📁 Project Structure

```
treasure-hunt/
├── contracts/
│   └── treasure-hunt/
│       ├── src/
│       │   └── lib.rs          # Smart contract code
│       └── Cargo.toml
├── frontend/
│   ├── src/
│   │   ├── App.tsx             # Main React component
│   │   ├── App.css             # Styling
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   └── .env                    # Contract ID config
├── deploy.sh                   # Deployment script
└── README.md
```

---

## ⚙️ Step-by-Step Setup

### Step 1: Setup Smart Contract (30 mins)

1. **Copy the contract code** to `contracts/treasure-hunt/src/lib.rs`
2. **Update Cargo.toml** with the provided configuration
3. **Add wasm32 target**:
   ```bash
   rustup target add wasm32-unknown-unknown
   ```

4. **Build the contract**:
   ```bash
   cd contracts/treasure-hunt
   stellar contract build
   ```

5. **Run tests**:
   ```bash
   cargo test
   ```

### Step 2: Deploy to Testnet (30 mins)

1. **Make deployment script executable**:
   ```bash
   chmod +x deploy.sh
   ```

2. **Run deployment**:
   ```bash
   ./deploy.sh
   ```

3. **Save the contract ID** from the output - you'll need it!

The script will:
- ✅ Build your contract
- ✅ Generate admin identity
- ✅ Fund the account with Friendbot
- ✅ Deploy to testnet
- ✅ Initialize the contract
- ✅ Create 2 sample treasure hunts
- ✅ Save contract info to `contract-info.json`

### Step 3: Setup Frontend (1 hour)

1. **Navigate to frontend**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Copy all frontend files**:
   - `App.tsx` → `src/App.tsx`
   - `App.css` → `src/App.css`
   - `package.json` (merge dependencies)
   - `vite.config.ts`

4. **Create `.env` file** in frontend directory:
   ```bash
   VITE_CONTRACT_ID=YOUR_CONTRACT_ID_FROM_DEPLOYMENT
   VITE_NETWORK_PASSPHRASE=Test SDF Network ; September 2015
   VITE_HORIZON_URL=https://horizon-testnet.stellar.org
   ```

5. **Update `index.html`** title:
   ```html
   <title>Virtual Treasure Hunt</title>
   ```

### Step 4: Run the App (5 mins)

```bash
npm run dev
```

Open http://localhost:5173 in your browser.

### Step 5: Test with Freighter (15 mins)

1. **Open Freighter wallet extension**
2. **Switch to Testnet** (Settings → Network → Testnet)
3. **Create/Import a testnet account**
4. **Fund your account**: Visit https://laboratory.stellar.org/#account-creator
5. **Connect wallet** in your app
6. **Try solving the riddles**!

---

## 🎮 Testing Your Treasure Hunt

### Riddle Answers:
- **Hunt 1 (Stellar Origins)**: `stellar`
- **Hunt 2 (Soroban Power)**: `soroban`

### Testing Checklist:
- [ ] Can connect Freighter wallet
- [ ] Wallet address displays correctly
- [ ] Can submit answers
- [ ] Correct answers award points
- [ ] Incorrect answers show error
- [ ] Can't submit same hunt twice
- [ ] Progress persists on page reload

---

## 🔧 Troubleshooting

### Contract Build Fails

```bash
# Make sure you're in the contract directory
cd contracts/treasure-hunt

# Clean and rebuild
cargo clean
stellar contract build
```

### Deployment Fails

```bash
# Check Stellar CLI version
stellar --version  # Should be 21.0.0+

# Verify network connectivity
curl https://friendbot.stellar.org

# Generate new identity if needed
stellar keys generate new-identity --network testnet
```

### Freighter Not Connecting

1. Check Freighter is on **Testnet** (not Mainnet or Futurenet)
2. Refresh the page
3. Try disconnecting and reconnecting
4. Check browser console for errors

### Frontend Build Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check Node version
node --version  # Should be 18+
```

---

## 📊 Contract Testing with CLI

You can interact with your deployed contract directly:

```bash
# Get hunt details
stellar contract invoke \
  --id YOUR_CONTRACT_ID \
  --network testnet \
  -- \
  get_hunt \
  --hunt_id 1

# Get player progress
stellar contract invoke \
  --id YOUR_CONTRACT_ID \
  --network testnet \
  -- \
  get_progress \
  --player YOUR_WALLET_ADDRESS

# Submit answer
stellar contract invoke \
  --id YOUR_CONTRACT_ID \
  --source your-identity \
  --network testnet \
  -- \
  submit_answer \
  --player YOUR_WALLET_ADDRESS \
  --hunt_id 1 \
  --answer "stellar"
```

---

## 🎨 Customization Ideas

### Add More Hunts
Edit `App.tsx` and add to `TREASURE_HUNTS` array:

```typescript
{
  id: 3,
  name: "DeFi Discovery",
  description: "Learn about decentralized finance",
  reward: 300,
  riddle: "What does DeFi stand for?"
}
```

### Change Styling
Edit `App.css` - modify colors, gradients, and layouts.

### Add Features
- Timer for each hunt
- Hints system (costs points)
- Team mode (multiple players)
- NFT rewards for completion
- Social sharing

---

## 📦 Deployment to Production

### Deploy Frontend

**Vercel:**
```bash
npm run build
npx vercel --prod
```

**Netlify:**
```bash
npm run build
netlify deploy --prod --dir=dist
```

### Environment Variables
Make sure to add `VITE_CONTRACT_ID` in your deployment platform.

---

## 🏆 Demo Day Tips

### What to Show:
1. ✅ **Architecture diagram** (show smart contract + frontend flow)
2. ✅ **Live demo** (connect wallet, solve hunt, show progress)
3. ✅ **Code walkthrough** (1-2 key functions)
4. ✅ **Stellar features** (emphasize Soroban, testnet, speed)
5. ✅ **Future vision** (what you'd add with more time)

### Talking Points:
- "Built on Stellar for fast, low-cost transactions"
- "Uses Soroban smart contracts for on-chain verification"
- "Players earn rewards for blockchain knowledge"
- "Demonstrates practical Web3 gaming use case"

### Common Questions:
- **Q: Why Stellar?** → Fast (3-5s), cheap (~$0.00001), easy Web3 integration
- **Q: Is it on mainnet?** → Currently testnet, ready for mainnet deployment
- **Q: Can you add real NFTs?** → Yes! Can integrate Stellar native assets
- **Q: How do you prevent cheating?** → Answers hashed on-chain, validated by contract

---

## 🔗 Useful Links

- **Stellar Docs**: https://developers.stellar.org/
- **Soroban Docs**: https://soroban.stellar.org/
- **Freighter Wallet**: https://freighter.app/
- **Stellar Laboratory**: https://laboratory.stellar.org/
- **Stellar Quest**: https://quest.stellar.org/ (learn more Stellar)

---

## 🆘 Need Help?

- **Stellar Discord**: https://discord.gg/stellar
- **GitHub Issues**: Create an issue in your repo
- **Stellar Stack Exchange**: https://stellar.stackexchange.com/

---

## 🎯 Success Checklist

Before demo day, verify:

- [ ] Contract deployed to testnet
- [ ] Frontend deployed and accessible via URL
- [ ] Freighter wallet connects successfully
- [ ] All riddles work correctly
- [ ] Progress persists
- [ ] No console errors
- [ ] README with setup instructions
- [ ] Demo script prepared
- [ ] Architecture diagram ready

---

## 📈 Next Steps (Post-Hackathon)

1. **Add more hunts** with varying difficulty
2. **Implement NFT rewards** using Stellar assets
3. **Create leaderboard** with on-chain data
4. **Add social features** (teams, chat)
5. **Mobile app** with React Native
6. **Mainnet deployment** for real rewards
7. **Token economy** with HUNT token
8. **Gamification** (levels, achievements, badges)

---

Good luck with your treasure hunt! 🏴‍☠️💎

Remember: The best project is a **working** project. Focus on getting the core features working smoothly rather than adding too many half-finished features!