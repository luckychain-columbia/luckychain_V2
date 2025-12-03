# 🔧 Immediate Fix Steps for "Internal JSON-RPC Error"

## The Problem

You're getting "Internal JSON-RPC error" when trying to finalize Raffle 0. This means Hardhat is rejecting the transaction before it runs.

## Quick Diagnosis

Run these commands to find the exact issue:

### Step 1: Check Contract Constants

```bash
cd /Users/alaradinc/Downloads/luckychain_Dec_2_2025/luckychain_V2/LuckyChain_V2/contract
node scripts/check-contract-constants.js --network localhost
```

**What to look for:**
- ✅ Should show `MIN_FINALIZATION_REWARD: 0.005 ETH`
- ❌ If it shows `0.001 ETH` → Contract not redeployed!

### Step 2: Check Raffle 0 State

```bash
cd /Users/alaradinc/Downloads/luckychain_Dec_2_2025/luckychain_V2/LuckyChain_V2/contract
node scripts/debug-raffle.js 0 --network localhost
```

**What to look for:**
- Contract balance vs required payouts
- Is raffle actually ready to finalize?
- Expected payout amounts

---

## Most Likely Fix: Complete Redeployment

Since Raffle 0 keeps failing, the safest solution is a **fresh start**:

### Option 1: Quick Fix (Keep Same Hardhat Session)

1. **Redeploy contract:**
   ```bash
   cd /Users/alaradinc/Downloads/luckychain_Dec_2_2025/luckychain_V2/LuckyChain_V2/contract
   npm run deploy -- --network localhost
   npm run export:abi
   ```

2. **Update frontend .env:**
   - Check `NEXT_PUBLIC_RAFFLE_CONTRACT_ADDRESS` matches new deployment

3. **Restart frontend:**
   ```bash
   cd /Users/alaradinc/Downloads/luckychain_Dec_2_2025/luckychain_V2/LuckyChain_V2
   # Press Ctrl+C, then:
   npm run dev
   ```

4. **Create NEW raffle** (don't use old Raffle 0):
   - Use seed amount >= 0.01 ETH
   - Buy tickets
   - Wait for max tickets or expiration
   - Try finalizing

### Option 2: Fresh Start (Reset Everything)

1. **Stop Hardhat node** (Terminal 1 - Ctrl+C)

2. **Restart Hardhat:**
   ```bash
   cd /Users/alaradinc/Downloads/luckychain_Dec_2_2025/luckychain_V2/LuckyChain_V2/contract
   npx hardhat node
   ```

3. **In Terminal 2 - Deploy:**
   ```bash
   cd /Users/alaradinc/Downloads/luckychain_Dec_2_2025/luckychain_V2/LuckyChain_V2/contract
   npm run deploy -- --network localhost
   npm run export:abi
   ```

4. **Update frontend .env** with new contract address

5. **Restart frontend:**
   ```bash
   cd /Users/alaradinc/Downloads/luckychain_Dec_2_2025/luckychain_V2/LuckyChain_V2
   npm run dev
   ```

6. **Create NEW raffle and test!**

---

## Why Raffle 0 Keeps Failing

**Raffle 0 was likely created with an old contract version!**

After any contract changes:
- Old raffles have incompatible state
- They may reference old logic
- **Always create NEW raffles after redeploying**

---

## If Still Failing After Redeploy

Run the diagnostic commands and share the output. The debug script will show exactly why the transaction is failing!

