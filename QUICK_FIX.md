# 🚨 Quick Fix: Contract Bytecode Missing from Hardhat

## The Problem

The errors show:
- ❌ "could not decode result data" 
- ❌ Contract Balance: 0.0 ETH
- ❌ All contract calls failing

**This means Hardhat node restarted and wiped contract bytecode from memory!**

When Hardhat restarts, ALL contracts are lost (they only exist in memory, not on disk).

---

## The Solution: Redeploy Everything

### Step 1: Make Sure Hardhat is Running

**Check Terminal 1** - is Hardhat node running? You should see:
```
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/
```

**If not running, start it:**
```bash
cd /Users/alaradinc/Downloads/luckychain_Dec_2_2025/luckychain_V2/LuckyChain_V2/contract
npx hardhat node
```

**Leave this running!** Don't close Terminal 1.

---

### Step 2: Deploy the Contract

**Open Terminal 2** (new terminal window):

```bash
cd /Users/alaradinc/Downloads/luckychain_Dec_2_2025/luckychain_V2/LuckyChain_V2/contract
npm run deploy -- --network localhost
```

**Look for output like:**
```
Contract deployed at: 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

**Copy the address!**

---

### Step 3: Export ABI

**Still in Terminal 2:**

```bash
npm run export:abi
```

This updates the frontend with the new contract interface.

---

### Step 4: Update Frontend .env

**Check your `.env.local` file:**

```bash
cd /Users/alaradinc/Downloads/luckychain_Dec_2_2025/luckychain_V2/LuckyChain_V2
cat .env.local
```

**Make sure it has:**
```
NEXT_PUBLIC_RAFFLE_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
```

**(Replace with the address from Step 2)**

---

### Step 5: Restart Frontend

**Open Terminal 3** (new terminal window):

```bash
cd /Users/alaradinc/Downloads/luckychain_Dec_2_2025/luckychain_V2/LuckyChain_V2
# If already running, press Ctrl+C first, then:
npm run dev
```

---

### Step 6: Create a NEW Raffle

**In the browser:**
1. Go to http://localhost:3000
2. Create a NEW raffle:
   - Seed amount: 0.01 ETH (or more)
   - Set ticket price
   - Set end date or max tickets
3. Buy tickets
4. Wait for max tickets or expiration
5. Try finalizing

**⚠️ Don't try to use old Raffle 0 - it doesn't exist anymore!**

---

## Why This Happened

**Hardhat node only stores contracts in memory, not on disk.**

When Hardhat restarts:
- ❌ All contracts disappear
- ❌ All contract state is lost
- ❌ All raffles are gone

**This is normal for local development!**

---

## Quick Command Summary

**Terminal 1 (keep running):**
```bash
cd /Users/alaradinc/Downloads/luckychain_Dec_2_2025/luckychain_V2/LuckyChain_V2/contract
npx hardhat node
```

**Terminal 2 (run once):**
```bash
cd /Users/alaradinc/Downloads/luckychain_Dec_2_2025/luckychain_V2/LuckyChain_V2/contract
npm run deploy -- --network localhost
npm run export:abi
```

**Terminal 3 (keep running):**
```bash
cd /Users/alaradinc/Downloads/luckychain_Dec_2_2025/luckychain_V2/LuckyChain_V2
npm run dev
```

---

## Verify It Works

After redeploying, run:

```bash
cd /Users/alaradinc/Downloads/luckychain_Dec_2_2025/luckychain_V2/LuckyChain_V2/contract
node scripts/check-contract-constants.js --network localhost
```

**Should show:**
```
✅ MIN_FINALIZATION_REWARD is correct (0.005 ETH)
✅ FINALIZATION_REWARD_BPS is correct (0.1%)
```

---

## Next Time

**To avoid this:**
- Keep Hardhat node running (don't restart it)
- If you must restart Hardhat, remember to redeploy!

