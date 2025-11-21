# Backend Restructure Summary

## What Was Done

I've restructured the backend code to match the old version's organization while keeping the current contract functionality. Here's what changed:

### New File Structure (Matching Old Version)

```
LuckyChain_V2/
  ├── app/
  │   ├── services/
  │   │   ├── contract.ts        # ✅ NEW: React hook pattern (useContract)
  │   │   └── mock-data.ts       # ✅ NEW: Extracted mock data
  │   ├── context/
  │   │   └── Web3Context.tsx    # ✅ NEW: React Context for wallet management
  │   ├── types/
  │   │   └── index.ts           # ✅ NEW: TypeScript type definitions
  │   └── utils/
  │       └── index.ts           # ✅ NEW: Utility functions
  └── lib/
      ├── web3.ts                # ⚠️ KEPT: Still used for ABI and base functions
      └── lottery-service.ts     # ⚠️ KEPT: Can be deprecated in favor of useContract hook
```

### Key Changes

1. **Created `app/services/contract.ts`**
   - React hook pattern (`useContract()`) matching old version
   - Integrates with Web3Context
   - Provides: `loadLotteries`, `createLottery`, `buyTicket`, `selectWinner`, `getTicketCount`, `getParticipants`
   - Falls back to mock data when contract not deployed

2. **Created `app/context/Web3Context.tsx`**
   - React Context for centralized wallet state
   - Provides: `account`, `connectWallet`, `disconnectWallet`, `provider`, `isConnecting`
   - Handles account change events
   - Optional network switching (commented out, can be enabled)

3. **Created `app/types/index.ts`**
   - Type definitions: `LotteryData`, `Lottery`, `Ticket`, `LotterySummary`
   - Matches old version structure
   - Ready for future enhancements (multiple winners, creator %, etc.)

4. **Created `app/utils/index.ts`**
   - Utility functions from old version:
     - `formatAddress` / `shortenAddress`
     - `formatEther` / `parseEther`
     - `normalizeLottery` - converts contract data to frontend format
     - `getTimeRemaining` - calculates time until lottery ends
     - `calculatePrizePool` - calculates prize pool
     - `calculateWinChance` - calculates win probability
     - `getTotalSpent` / `getTotalWon` - user statistics

5. **Created `app/services/mock-data.ts`**
   - Extracted mock lottery data for better organization
   - Used by contract service for fallback

### Migration Path

**Old Code (lib/lottery-service.ts):**
```typescript
import { getAllLotteries } from "@/lib/lottery-service"
```

**New Code (app/services/contract.ts):**
```typescript
import useContract from "@/app/services/contract"

function MyComponent() {
  const { loadLotteries, createLottery, buyTicket } = useContract()
  // Use the hook methods
}
```

**Old Code (lib/web3.ts):**
```typescript
import { useAccount } from "@/lib/web3"
```

**New Code (app/context/Web3Context.tsx):**
```typescript
import { useWeb3 } from "@/app/context/Web3Context"

function MyComponent() {
  const { account, connectWallet, provider } = useWeb3()
  // Use context values
}
```

### What's Preserved

- ✅ All existing functionality maintained
- ✅ Mock data fallback still works
- ✅ Current smart contract compatibility
- ✅ Error handling patterns

### What's Improved

- ✅ Better organization matching old version structure
- ✅ React Context for centralized state management
- ✅ More utility functions available
- ✅ Better type definitions
- ✅ Hook pattern for better React integration

### Next Steps (Optional)

1. **Update components** to use new structure:
   - Replace `useAccount` from `lib/web3` with `useWeb3` from context
   - Replace direct function calls with `useContract` hook
   - Wrap app with `Web3Provider`

2. **Consider deprecating** old files:
   - `lib/lottery-service.ts` (can use `useContract` hook instead)
   - Parts of `lib/web3.ts` (keep ABI and base utilities)

3. **Future enhancements** (if needed):
   - Update contract to support multiple winners
   - Add creator percentage support
   - Add multiple ticket purchase support
   - Add pagination for lotteries

### Files Created

- ✅ `BACKEND_COMPARISON.md` - Detailed comparison document
- ✅ `app/services/contract.ts` - Contract service hook
- ✅ `app/services/mock-data.ts` - Mock data
- ✅ `app/context/Web3Context.tsx` - Web3 context
- ✅ `app/types/index.ts` - Type definitions
- ✅ `app/utils/index.ts` - Utility functions

### Compatibility

The old `lib/web3.ts` and `lib/lottery-service.ts` files are still present and functional. You can:
- Gradually migrate to new structure
- Use both side-by-side during transition
- Keep old files for backward compatibility

