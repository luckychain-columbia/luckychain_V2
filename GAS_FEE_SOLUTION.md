# Gas Fee Solution - Recommended Changes

## Current Problem

**Minimum finalization reward (0.001 ETH) may not cover actual gas costs (~0.005 ETH)**

## Recommended Solution

### 1. Increase Minimum Reward to Cover Typical Gas

**Contract Change:**
```solidity
// OLD: uint256 public constant MIN_FINALIZATION_REWARD = 0.001 ether;
// NEW: 
uint256 public constant MIN_FINALIZATION_REWARD = 0.005 ether; // 0.005 ETH (covers typical gas)
```

### 2. Update Minimum Seed Requirement

**Contract Change:**
```solidity
// Already has: require(seedAmount >= MIN_FINALIZATION_REWARD, "...");
// This will automatically require 0.005 ETH with the new constant
```

**Frontend Changes:**
- Minimum seed: 0.001 ETH → **0.005 ETH**
- Default value: "0.001" → **"0.005"**
- Helper text: "Minimum 0.005 ETH to ensure finalization gas costs are covered"

## Why 0.005 ETH?

- **Typical finalization gas:** ~500k-1.5M gas units
- **Average gas price:** 20-50 gwei
- **Cost:** 0.005-0.015 ETH (varies by network)
- **0.005 ETH:** Covers low-medium gas scenarios

## Impact

| Before | After |
|--------|-------|
| Seed min: 0.001 ETH | Seed min: **0.005 ETH** |
| Reward min: 0.001 ETH | Reward min: **0.005 ETH** |
| Gas coverage: ❌ Often insufficient | Gas coverage: ✅ Always covered |

## Trade-offs

**Pros:**
- ✅ Finalizer always compensated
- ✅ Prevents losses for finalizers
- ✅ Ensures raffles can finalize

**Cons:**
- ⚠️ Higher barrier to entry (need 0.005 ETH)
- ⚠️ Small raffles require more capital

## Alternative: Keep 0.001 ETH, Add Warning

If we want to keep the lower barrier:
- Keep minimum at 0.001 ETH
- Add warning: "Finalization reward may not cover gas costs on high-gas networks"
- Let users decide if they want to seed more

## Decision Needed

**Do you want to:**
1. ✅ **Increase to 0.005 ETH** (recommended - ensures gas coverage)
2. ⚠️ **Keep at 0.001 ETH** (lower barrier, but finalizer may lose money)
3. 🔄 **Something else?** (e.g., dynamic based on gas price)


