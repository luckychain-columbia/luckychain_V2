# 🚀 Quick Start Guide - Launch Locally

All dependencies are installed! Follow these 3 steps to launch:

## Step-by-Step Launch

### Terminal 1: Start Local Blockchain

```bash
cd /Users/alaradinc/Downloads/luckychain_Dec_2_2025/luckychain_V2/LuckyChain_V2/contract
npx hardhat node
```

**Keep this terminal open!** You'll see 20 test accounts with private keys.

### Terminal 2: Deploy Contract

Open a NEW terminal window, then:

```bash
cd /Users/alaradinc/Downloads/luckychain_Dec_2_2025/luckychain_V2/LuckyChain_V2/contract
npm run deploy -- --network localhost
```

This will deploy the contract and automatically update the frontend `.env.local` file.

### Terminal 3: Start Frontend

Open a NEW terminal window, then:

```bash
cd /Users/alaradinc/Downloads/luckychain_Dec_2_2025/luckychain_V2/LuckyChain_V2
npm run dev
```

Then visit: **http://localhost:3000**

---

## Configure MetaMask

1. **Add Local Network:**
   - Open MetaMask
   - Network dropdown → "Add Network" → "Add a network manually"
   - **Network Name:** Hardhat Localhost
   - **RPC URL:** `http://127.0.0.1:8545`
   - **Chain ID:** `31337`
   - **Currency Symbol:** `ETH`
   - Click "Save"

2. **Import Test Account:**
   - In Terminal 1 (hardhat node), copy any private key from the test accounts
   - MetaMask → Account icon → "Import Account"
   - Paste the private key
   - You now have 10,000 ETH! 🎉

---

## You're Ready!

- ✅ Dependencies installed
- ✅ Ready to start Hardhat node
- ✅ Ready to deploy contract
- ✅ Ready to run frontend

**Next:** Open 3 terminal windows and follow the steps above!

---

## Need Help?

See `LOCAL_SETUP.md` for detailed troubleshooting and explanations.

