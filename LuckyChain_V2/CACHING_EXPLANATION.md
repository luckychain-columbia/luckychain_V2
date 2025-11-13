# Contract Call Caching Explanation

## What is "Caching Contract Calls"?

When your frontend reads data from a smart contract on the blockchain, it makes **RPC (Remote Procedure Call) requests** to a node (like Infura, Alchemy, or a local node). These calls:

1. **Go over the network** - Add latency (delay)
2. **Cost money** - Some RPC providers charge per request
3. **Have rate limits** - Too many calls can get you blocked
4. **Are slow** - Each call takes time to complete

## Current Situation (Without Caching)

Looking at your code, here's what happens:

### 1. Page Load (`app/page.tsx`)
```typescript
// Every time the page loads, this makes RPC calls:
const data = await loadRafflesFromContract()
// This calls:
// - contract.raffleCount() - 1 RPC call
// - contract.getRaffles(0, count) - 1 RPC call
// - contract.getWinners(i) for EACH raffle - N RPC calls (N = number of raffles)
```

### 2. Every 30 Seconds
```typescript
// Refresh raffles periodically to catch expired ones
const interval = setInterval(() => {
  handleLoadRaffles()  // Makes ALL the same RPC calls again!
}, 30000) // Every 30 seconds
```

**Problem**: Even completed raffles (that won't change) are re-fetched every 30 seconds!

### 3. Each Raffle Card (`components/raffle-card.tsx`)
```typescript
// Each card makes separate RPC calls:
loadParticipants()  // RPC call to getParticipants(raffleId)
loadWinners()       // RPC call to getWinners(raffleId)
```

**Problem**: If you have 10 raffles on the page, that's 20+ RPC calls just for participants/winners!

### Example: Current Flow
```
User opens page
  ↓
1. loadRaffles() called
   - RPC: raffleCount() 
   - RPC: getRaffles(0, 10)
   - RPC: getWinners(0) × 10 raffles = 10 calls
   Total: 12 RPC calls

2. Each RaffleCard loads
   - RPC: getParticipants(0)
   - RPC: getParticipants(1)
   - RPC: getParticipants(2)
   ... (one per card)
   Total: 10 RPC calls

3. After 30 seconds
   - Repeat all above = 22 more RPC calls

Total for first minute: 44 RPC calls!
```

## What Caching Would Do

### Strategy 1: Cache by Raffle State

```typescript
// Completed raffles never change - cache forever
if (raffle.isCompleted) {
  // Use cached data, no RPC call needed
  return cachedData
}

// Active raffles can change - cache for 10 seconds
if (cachedData && Date.now() - cachedData.timestamp < 10000) {
  return cachedData.data
}
// Otherwise, make RPC call and update cache
```

### Strategy 2: Cache by Data Type

```typescript
// Cache completed raffles indefinitely
const completedRafflesCache = new Map<number, CachedData>()

// Cache active raffles for 10 seconds
const activeRafflesCache = new Map<number, CachedData>()

// Cache participants for 5 seconds (they change frequently)
const participantsCache = new Map<number, CachedData>()
```

### Strategy 3: Invalidate on Transactions

```typescript
// When user buys a ticket
await buyTicket(raffleId, price, count)

// Invalidate cache for that raffle
cache.invalidate(raffleId)
// Next time it's loaded, fresh data will be fetched
```

## Benefits of Caching

### 1. **Faster Load Times**
- First load: Same speed (cache is empty)
- Subsequent loads: **Instant** (uses cached data)
- No waiting for RPC calls

### 2. **Reduced RPC Calls**
- **Before**: 44 RPC calls in first minute
- **After**: ~12 RPC calls (only when cache expires or invalidated)
- **Savings**: ~73% reduction

### 3. **Better User Experience**
- Instant data display (no loading spinners)
- Smoother interactions
- Works offline (for cached data)

### 4. **Cost Savings**
- Fewer RPC calls = Lower costs (if using paid providers)
- Stays within rate limits
- Better for free tier limits

### 5. **Reduced Server Load**
- Less load on RPC providers
- More reliable service
- Better for other users

## Example: With Caching

```
User opens page (First time)
  ↓
1. loadRaffles() called
   - Cache empty, make RPC calls: 12 calls
   - Store in cache with timestamps

2. Each RaffleCard loads
   - Check cache first
   - Cache empty, make RPC calls: 10 calls
   - Store in cache

3. User navigates away and comes back (30 seconds later)
   - loadRaffles() called
   - Check cache: Still valid (completed raffles)
   - Only fetch new/active raffles: 2 calls
   - Use cached data for completed: 0 calls
   Total: 2 RPC calls (vs 12 without cache)

4. User clicks on a raffle card
   - Check cache: Participants cached 5 seconds ago
   - Cache valid, use cached data: 0 calls
   - No RPC call needed!
```

## Implementation Example

Here's a simple cache implementation:

```typescript
// Simple in-memory cache
const cache = new Map<string, {
  data: any
  timestamp: number
  ttl: number // Time to live in milliseconds
}>()

async function getCachedOrFetch<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl: number = 10000 // Default 10 seconds
): Promise<T> {
  const cached = cache.get(key)
  
  // Check if cache exists and is still valid
  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    return cached.data
  }
  
  // Cache miss or expired - fetch fresh data
  const data = await fetchFn()
  
  // Store in cache
  cache.set(key, {
    data,
    timestamp: Date.now(),
    ttl
  })
  
  return data
}

// Usage:
const raffles = await getCachedOrFetch(
  'raffles',
  () => loadRafflesFromContract(),
  raffle.isCompleted ? Infinity : 10000 // Completed raffles cache forever
)
```

## When to Invalidate Cache

1. **After Transactions**
   - After buying a ticket → Invalidate that raffle's cache
   - After creating a raffle → Invalidate raffles list
   - After finalizing → Invalidate that raffle's cache

2. **Time-Based**
   - Active raffles: Cache for 10 seconds
   - Completed raffles: Cache forever (never change)
   - Participants: Cache for 5 seconds (change frequently)

3. **Manual Refresh**
   - User clicks "Refresh" button → Clear all cache
   - After user actions → Clear relevant cache

## Summary

**Caching contract calls** means:
- Storing RPC call results in memory
- Reusing cached data when appropriate
- Only making new RPC calls when:
  - Cache is empty (first load)
  - Cache is expired (time-based)
  - Cache is invalidated (after transactions)

**Result**: Faster, cheaper, more efficient application with better user experience!

