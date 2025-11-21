# Details

## Detailed Component Documentation

### 1. Web3Context (`app/context/Web3Context.tsx`)

**Purpose**: Centralized wallet state management using React Context API.

**Key Functions**:

- **`connectWallet()`**: Connects to a Web3 wallet
  - Detects available wallets using `detectWallets()`
  - If multiple wallets, shows selection dialog
  - Requests account access via `window.ethereum.request({ method: 'eth_requestAccounts' })`
  - Creates `BrowserProvider` from ethers.js
  - Stores account and provider in state
  - Sets up account change listener

- **`disconnectWallet()`**: Disconnects wallet
  - Clears account and provider from state
  - Removes event listeners

- **`selectWallet(wallet)`**: Selects a specific wallet provider
  - Sets the selected wallet as `window.ethereum`
  - Connects to the selected wallet

- **`detectWallets()`**: Detects available wallet providers
  - Checks for `window.ethereum` (EIP-1193 standard)
  - If array of providers, detects each wallet type
  - Identifies wallet by provider properties (isMetaMask, isCoinbaseWallet, etc.)
  - Returns array of `WalletProvider` objects

**State**:
- `account`: Connected wallet address (string | null)
- `provider`: Ethers.js BrowserProvider (BrowserProvider | null)
- `isConnecting`: Loading state (boolean)
- `availableWallets`: List of available wallets (WalletProvider[])

**Usage**:
```typescript
const { account, connectWallet, disconnectWallet, provider } = useWeb3()
```

---

### 2. useContract Hook (`app/services/contract.ts`)

**Purpose**: React hook for interacting with the Raffle smart contract.

**Key Functions**:

#### `loadRaffles(): Promise<ContractRaffle[]>`
Loads all raffles from the contract with caching.

**Process**:
1. Gets contract instance (read-only)
2. Checks cache for raffles list
3. If cached and valid, returns cached data
4. Gets raffle count (with caching, 30s TTL)
5. Batch fetches raffles using `contract.getRaffles(0, count)`
6. For each raffle, fetches winners (with caching)
7. Caches individual raffle info and list
8. Returns raffles array

**Cache Strategy**:
- Raffles list: 10s TTL
- Individual raffle info: 10s TTL (active), Infinity (completed)
- Winners: Infinity TTL (completed), 10s TTL (active)
- Raffle count: 30s TTL

#### `createRaffle(params): Promise<string>`
Creates a new raffle on the blockchain.

**Parameters**:
- `title`: Raffle title (string, required, max 100 chars)
- `description`: Raffle description (string, required)
- `entryFee`: Ticket price in ETH (string, required, 0.0001-1000 ETH)
- `endDateTime`: End timestamp (number, required, must be in future)
- `numWinners`: Number of winners (number, required, 1-100)
- `creatorFeePct`: Creator fee percentage (number, required, 0-100)
- `maxEntrants`: Max participants (number | null, optional, 1-10,000)
- `allowMultipleEntries`: Allow multiple tickets (boolean, required)
- `seedPrizePool`: Seed amount in ETH (string, optional, 0-1000 ETH)

**Process**:
1. Validates all inputs (client-side)
2. Checks user's ETH balance (if seeding prize pool)
3. Converts creator fee to basis points (0-10,000)
4. Converts max entrants to BigInt (0 for unlimited)
5. Parses seed amount to wei (if provided)
6. Gets contract instance with signer
7. Calls `contract.createRaffle()` with parameters and seed amount as `value`
8. Waits for transaction confirmation (5min timeout)
9. Validates transaction receipt
10. Extracts raffle ID from transaction receipt
11. Invalidates cache (raffles list, raffle count)
12. Returns raffle ID

**Error Handling**:
- User rejection: "Transaction was rejected by user"
- Insufficient balance: Shows user's balance and required amount
- Transaction timeout: "Transaction timeout - please check your wallet"
- Contract revert: Extracts error reason from contract

#### `buyTicket(raffleId, ticketPriceEth, ticketCount): Promise<TransactionReceipt>`
Purchases tickets for a raffle.

**Parameters**:
- `raffleId`: Raffle ID (number, required)
- `ticketPriceEth`: Ticket price in ETH (number, required)
- `ticketCount`: Number of tickets (number, required, 1-1000)

**Process**:
1. Validates ticket count (1-1000 per transaction)
2. Validates ticket price (must be > 0)
3. Checks for overflow in total value calculation
4. Pre-checks user's ETH balance (including gas estimate)
5. Gets contract instance with signer
6. Calculates total cost (ticket price × ticket count)
7. Calls `contract.buyTickets(raffleId, ticketCount)` with ETH value
8. Waits for transaction confirmation (5min timeout)
9. Validates transaction receipt
10. Invalidates cache (raffle info, participants, list)
11. Returns transaction receipt

**Error Handling**:
- Insufficient balance: Shows user's balance and required amount
- Raffle not active: "Raffle is not active"
- Raffle closed: "Raffle closed"
- Max tickets reached: "Max entrants reached"
- Multiple entries disabled: "Already entered" or "Multiple tickets disabled"

#### `selectWinner(raffleId): Promise<TransactionReceipt>`
Finalizes a raffle and selects winners.

**Parameters**:
- `raffleId`: Raffle ID (number, required)

**Process**:
1. Gets contract instance with signer
2. Calls `contract.selectWinner(raffleId)` (calls `finalizeRaffle` internally)
3. Waits for transaction confirmation (5min timeout)
4. Validates transaction receipt
5. Invalidates cache (raffle info, winners, list)
6. Returns transaction receipt

**Error Handling**:
- Raffle not active: "Raffle not active"
- Raffle already completed: "Raffle completed"
- No participants: "No participants"
- Raffle ongoing: "Raffle ongoing" (if not expired and max tickets not reached)

#### `getParticipants(raffleId): Promise<string[]>`
Gets list of participants for a raffle.

**Process**:
1. Gets contract instance (read-only)
2. Checks cache for participants (5s TTL)
3. If cached and valid, returns cached data
4. Calls `contract.getParticipants(raffleId)`
5. Caches participants
6. Returns participants array

#### `getWinners(raffleId): Promise<string[]>`
Gets list of winners for a raffle.

**Process**:
1. Gets contract instance (read-only)
2. Checks cache for winners (Infinity TTL for completed, 10s for active)
3. If cached and valid, returns cached data
4. Calls `contract.getWinners(raffleId)`
5. Caches winners
6. Returns winners array

#### `getTicketCount(raffleId, userAddress): Promise<number>`
Gets number of tickets a user has for a raffle.

**Process**:
1. Gets contract instance (read-only)
2. Calls `contract.getUserTickets(raffleId, userAddress)`
3. Returns ticket count (array length)

---

### 3. Contract Cache (`lib/contract-cache.ts`)

**Purpose**: In-memory caching system for RPC call results to reduce network requests.

**Key Classes**:

#### `ContractCache`
Singleton class managing cache entries.

**Methods**:

- **`getOrFetch<T>(key, fetchFn, ttl): Promise<T>`**: Gets cached data or fetches if not cached/expired
  - Checks cache for key
  - If cached and valid (not expired), returns cached data
  - If not cached or expired, calls `fetchFn()` to fetch data
  - Stores fetched data in cache with TTL
  - Returns data

- **`set<T>(key, data, ttl): void`**: Sets cache entry
  - Stores data with timestamp and TTL
  - If TTL not provided, uses default TTL (10s)

- **`get<T>(key): T | null`**: Gets cached data without fetching
  - Returns cached data if valid, null if not cached or expired

- **`invalidate(key): void`**: Invalidates specific cache entry
  - Deletes cache entry by key

- **`invalidatePattern(pattern): void`**: Invalidates cache entries matching pattern
  - Deletes all cache entries matching regex pattern

- **`invalidateRaffle(raffleId): void`**: Invalidates all cache entries for a raffle
  - Invalidates pattern `raffle:{raffleId}:.*`
  - Invalidates raffles list cache

- **`cleanup(): void`**: Cleans up expired cache entries
  - Removes all expired entries from cache
  - Called automatically every 30 seconds

**Cache TTLs**:
- Completed raffles: Infinity (never expire)
- Active raffles: 10 seconds
- Participants: 5 seconds
- Raffle count: 30 seconds
- Raffles list: 10 seconds

**Cache Keys**:
- `raffles:list`: Raffles list
- `raffle:{id}:info`: Raffle info
- `raffle:{id}:config`: Raffle config
- `raffle:{id}:participants`: Raffle participants
- `raffle:{id}:winners`: Raffle winners
- `raffle:{id}:tickets:{address}`: User's tickets for a raffle
- `raffle:count`: Raffle count

**Usage**:
```typescript
import { contractCache, cacheKeys } from "@/lib/contract-cache"

// Get or fetch with caching
const raffles = await contractCache.getOrFetch(
  cacheKeys.rafflesList(),
  async () => await contract.getRaffles(0, count),
  contractCache.getRafflesListTTL()
)

// Invalidate cache
contractCache.invalidateRaffle(raffleId)
```

---

### 4. Contract Utils (`app/services/contract-utils.ts`)

**Purpose**: Common utility functions for contract interactions.

**Key Functions**:

#### `extractErrorMessage(error, defaultMessage): string`
Extracts user-friendly error message from various error types.

**Process**:
1. Checks for user rejection (error.code === 4001)
2. Checks for transaction timeout
3. Checks for contract revert with reason (error.reason)
4. Checks for specific error messages (insufficient balance, etc.)
5. Returns error.message or defaultMessage

**Usage**:
```typescript
try {
  await contract.createRaffle(...)
} catch (error) {
  const errorMessage = extractErrorMessage(error, "Failed to create raffle")
  toast({ title: "Error", description: errorMessage })
}
```

#### `waitForTransaction(txPromise, timeoutMs): Promise<TransactionReceipt>`
Waits for transaction with timeout.

**Process**:
1. Races transaction promise with timeout promise
2. If transaction completes before timeout, returns receipt
3. If timeout occurs first, throws error

**Usage**:
```typescript
const receipt = await waitForTransaction(tx.wait(), 5 * 60 * 1000) // 5 minutes
```

#### `validateReceipt(receipt): void`
Validates transaction receipt.

**Process**:
1. Checks receipt exists and has status
2. Throws error if receipt is invalid or transaction failed

#### `extractRaffleIdFromReceipt(receipt, contract): string | null`
Extracts raffle ID from transaction receipt.

**Process**:
1. Finds `RaffleCreated` event in receipt logs
2. Parses event using contract interface
3. Extracts raffle ID from event args
4. Returns raffle ID or null

#### `validateAndParseEther(amount, fieldName): bigint`
Validates and parses ether amount to wei.

**Process**:
1. Parses amount string to wei using `ethers.parseEther()`
2. Validates amount is greater than 0
3. Returns wei as bigint
4. Throws error if invalid

#### `validateTicketCount(ticketCount, maxTicketsPerTransaction, maxTicketsPerRaffle): void`
Validates ticket count.

**Process**:
1. Validates ticket count is positive integer
2. Validates ticket count doesn't exceed per-transaction limit (1000)
3. Validates ticket count doesn't exceed per-raffle limit (10,000)
4. Throws error if invalid

#### `checkOverflow(a, b): boolean`
Checks for overflow in BigInt multiplication.

**Process**:
1. Calculates product (a * b)
2. Checks if product / a === b (overflow check)
3. Returns true if overflow, false otherwise

#### `invalidateRaffleCreationCache(contractCache, cacheKeys): void`
Invalidates cache after creating a new raffle.

**Process**:
1. Invalidates raffles list cache
2. Invalidates raffle count cache

---

### 5. RaffleCard Component (`components/raffle-card.tsx`)

**Purpose**: Displays individual raffle information and handles user interactions.

**Key Features**:
- Displays raffle title, description, ticket price, prize pool
- Shows progress bar (tickets sold / max tickets)
- Allows users to buy tickets (if active and not ended)
- Allows users to finalize raffle (if expired or max tickets reached)
- Shows winners (if completed)
- Copy URL button for sharing
- Responsive design with mobile support

**Key Functions**:

#### `handleBuyTicket()`
Handles ticket purchase.

**Process**:
1. Validates user is connected
2. Validates raffle is active and not ended
3. Validates ticket count (1-1000 per transaction)
4. Validates capacity (not reached, enough tickets remaining)
5. Calls `useContract().buyTicket()` with raffle ID, ticket price, ticket count
6. Shows success toast
7. Refreshes participants and winners
8. Resets ticket count to 1

#### `handleFinalizeRaffle()`
Handles raffle finalization.

**Process**:
1. Validates user is connected
2. Calls `useContract().selectWinner()` with raffle ID
3. Shows success toast
4. Refreshes participants and winners

**Memoization**:
- `raffleCalculations`: Memoized expensive calculations (progress, rewards, etc.)
- `timeData`: Memoized time calculations (days left, hours left, etc.)
- `desiredTicketCount`: Memoized ticket count (1 if multiple entries disabled)
- `capacityReached`, `exceedsCapacity`, `exceedsTransactionLimit`: Memoized validation checks

**Optimization**:
- Wrapped with `React.memo` to prevent unnecessary re-renders
- Uses `useMemo` for expensive calculations
- Uses `useCallback` for event handlers

---

### 6. CreateRaffleDialog Component (`components/create-raffle-dialog.tsx`)

**Purpose**: Dialog form for creating new raffles.

**Key Features**:
- Form validation (client-side)
- Seed prize pool input (optional)
- Creator fee slider (0-50%)
- Date/time picker for end date
- Multiple entries checkbox
- Dynamic button text (shows seed amount if provided)
- Loading state during transaction

**Key Functions**:

#### `handleSubmit(e)`
Handles form submission.

**Process**:
1. Prevents default form submission
2. Validates all inputs:
   - Title: Required, max 50 characters
   - Entry fee: Required, 0.0001-1000 ETH
   - End date: Required, must be in future, max 1 year
   - Number of winners: Required, 1-100
   - Max entrants: Optional, 1-10,000, must be >= number of winners
   - Seed prize pool: Optional, 0-1000 ETH
3. Converts form data to contract parameters
4. Calls `useContract().createRaffle()` with parameters
5. Shows success toast
6. Closes dialog and resets form
7. Calls `onSuccess` callback

**Validation**:
- Real-time validation on input change
- Clamping values on blur (entry fee, number of winners, max entrants)
- Balance check (if seeding prize pool)
- Gas estimate warning (if balance is close to required amount)

---

### 7. WalletConnect Component (`components/wallet-connect.tsx`)

**Purpose**: Wallet connection UI with multi-wallet support.

**Key Features**:
- Connect/disconnect wallet button
- Multi-wallet selection dialog (if multiple wallets detected)
- Displays connected wallet address (shortened)
- Loading state during connection
- Responsive design (mobile support)

**Key Functions**:

#### `handleConnect()`
Handles wallet connection.

**Process**:
1. If multiple wallets available, shows selection dialog
2. If single wallet or no wallets, uses default connection
3. Calls `useWeb3().connectWallet()`
4. Handles errors (shows toast)

#### `handleSelectWallet(wallet)`
Handles wallet selection from dialog.

**Process**:
1. Closes selection dialog
2. Calls `useWeb3().selectWallet(wallet)`
3. Handles errors (shows toast)

#### `handleDisconnect()`
Handles wallet disconnection.

**Process**:
1. Calls `useWeb3().disconnectWallet()`

---


## Smart Contract Details

### Contract: Raffle.sol

**Location**: `contract/contracts/Raffle.sol`

**Purpose**: Manages raffle creation, ticket purchases, winner selection, and prize distribution on the Ethereum blockchain.

### Key Data Structures

#### `RaffleInfo` Struct
Stores raffle information.

```solidity
struct RaffleInfo {
    address creator;          // Raffle creator address
    string title;             // Raffle title
    string description;       // Raffle description
    uint256 ticketPrice;      // Ticket price in wei
    uint256 maxTickets;       // Max tickets (0 = unlimited)
    uint256 endTime;          // End timestamp
    bool isActive;            // Is raffle active
    bool isCompleted;         // Is raffle completed
    address winner;           // Primary winner (first winner if multiple)
    uint256 totalPool;        // Total prize pool in wei
}
```

#### `RaffleConfig` Struct
Stores raffle configuration.

```solidity
struct RaffleConfig {
    uint8 numWinners;              // Number of winners (1-100)
    uint16 creatorPct;             // Creator fee in basis points (0-10,000)
    bool allowMultipleEntries;     // Allow multiple tickets per user
}
```

### Key Mappings

```solidity
mapping(uint256 => RaffleInfo) private raffles;                    // Raffle info by ID
mapping(uint256 => RaffleConfig) private raffleSettings;           // Raffle config by ID
mapping(uint256 => address[]) private raffleParticipants;          // Participants by raffle ID
mapping(uint256 => address[]) private raffleWinners;               // Winners by raffle ID
mapping(uint256 => mapping(address => uint256[])) private userTickets;  // User tickets by raffle ID and address
```

### Key Constants

```solidity
uint16 public constant MAX_CREATOR_PCT = 10_000;                    // 100% (in basis points)
uint256 public constant MAX_TICKETS_PER_TRANSACTION = 1000;         // Max tickets per transaction
uint256 public constant MAX_TICKETS_PER_RAFFLE = 10_000;           // Max tickets per raffle
uint256 public constant MIN_FINALIZATION_REWARD = 0.001 ether;      // Min finalization reward
uint256 public constant MAX_FINALIZATION_REWARD = 0.01 ether;       // Max finalization reward
uint16 public constant FINALIZATION_REWARD_BPS = 10;                // 0.1% of pool (in basis points)
```

### Key Functions

#### `createRaffle(...) external payable returns (uint256)`
Creates a new raffle.

**Parameters**:
- `_title`: Raffle title (string, required, max 100 chars)
- `_description`: Raffle description (string, required)
- `_ticketPrice`: Ticket price in wei (uint256, required, > 0)
- `_endDateTime`: End timestamp (uint256, required, must be in future)
- `_numWinners`: Number of winners (uint8, required, 1-100)
- `_creatorPct`: Creator fee in basis points (uint16, required, 0-10,000)
- `_maxTickets`: Max tickets (uint256, required, 0 = unlimited, max 10,000)
- `_allowMultipleEntries`: Allow multiple tickets (bool, required)

**Process**:
1. Validates inputs (title, ticket price, end date, number of winners, creator fee, max tickets)
2. Gets next raffle ID (auto-increment)
3. Initializes `RaffleInfo` with seed amount (`msg.value`) as `totalPool`
4. Initializes `RaffleConfig` with configuration
5. Emits `RaffleCreated` event
6. Returns raffle ID

**Events**:
```solidity
event RaffleCreated(
    uint256 indexed raffleId,
    address indexed creator,
    string title,
    uint256 ticketPrice,
    uint256 maxTickets,
    uint256 endTime,
    uint8 numWinners,
    uint16 creatorPct,
    bool allowMultipleEntries,
    uint256 seedAmount
);
```

#### `buyTickets(uint256 _raffleId, uint256 _ticketCount) public payable`
Purchases tickets for a raffle.

**Parameters**:
- `_raffleId`: Raffle ID (uint256, required)
- `_ticketCount`: Number of tickets (uint256, required, 1-1000)

**Process**:
1. Validates ticket count (1-1000 per transaction)
2. Validates raffle is active and not ended
3. Validates capacity (not reached, enough tickets remaining)
4. Validates multiple entries (if disabled, user can't have tickets already)
5. Validates ETH sent (must equal ticket price × ticket count)
6. Adds user to participants array (`_ticketCount` times)
7. Stores ticket numbers for user
8. Updates total pool (adds `msg.value`)
9. Emits `TicketsPurchased` event

**Events**:
```solidity
event TicketsPurchased(
    uint256 indexed raffleId,
    address indexed participant,
    uint256[] ticketNumbers,
    uint256 amountPaid
);
```

#### `finalizeRaffle(uint256 _raffleId) external`
Finalizes a raffle and selects winners.

**Parameters**:
- `_raffleId`: Raffle ID (uint256, required)

**Process**:
1. Validates raffle is active and not completed
2. Checks if raffle has expired OR max tickets reached
3. If expired, anyone can finalize (with reward)
4. If max tickets reached (not expired), only creator can finalize (no reward)
5. Calls `_finalizeRaffle(_raffleId, isExpired)`

#### `_finalizeRaffle(uint256 _raffleId, bool _isExpired) internal`
Internal function that handles raffle finalization logic.

**Process**:
1. Validates raffle is active and not completed
2. Requires at least one participant
3. Selects winners using pseudo-random number generation:
   - Uses `keccak256` hash of `block.timestamp`, `block.prevrandao`, `block.number`, `raffleId`, `i`
   - Modulo remaining participants to select winner
   - Swaps selected index with last element to avoid reselection
4. Calculates rewards:
   - Creator reward: `(pool * creatorPct) / MAX_CREATOR_PCT`
   - Finalization reward (if expired): `min(max(pool * FINALIZATION_REWARD_BPS / 10000, MIN_FINALIZATION_REWARD), MAX_FINALIZATION_REWARD)`
   - Prize pool: `pool - creatorReward - finalizationReward`
5. Distributes prizes:
   - Pays finalization reward to finalizer (if expired)
   - Pays creator reward to creator
   - Pays prize per winner to winners (equal split)
   - Pays remainder to first winner (to avoid fund loss)
6. Marks raffle as completed
7. Emits `WinnersSelected` event

**Events**:
```solidity
event WinnersSelected(
    uint256 indexed raffleId,
    address[] winners,
    uint256 prizePerWinner,
    uint256 creatorReward,
    uint256 finalizationReward,
    address finalizer
);
```

#### `getRaffleInfo(uint256 _raffleId) external view returns (RaffleInfo memory)`
Gets raffle information.

**Returns**: `RaffleInfo` struct

#### `getRaffleConfig(uint256 _raffleId) external view returns (RaffleConfig memory)`
Gets raffle configuration.

**Returns**: `RaffleConfig` struct

#### `getParticipants(uint256 _raffleId) external view returns (address[] memory)`
Gets list of participants for a raffle.

**Returns**: Array of participant addresses

#### `getWinners(uint256 _raffleId) external view returns (address[] memory)`
Gets list of winners for a raffle.

**Returns**: Array of winner addresses

#### `getUserTickets(uint256 _raffleId, address _user) external view returns (uint256[] memory)`
Gets user's tickets for a raffle.

**Returns**: Array of ticket numbers

#### `getRaffles(uint256 start, uint256 count) external view returns (RaffleInfo[] memory infos, RaffleConfig[] memory configs)`
Gets multiple raffles in batch (for efficient pagination).

**Parameters**:
- `start`: Start index (uint256, required)
- `count`: Number of raffles to fetch (uint256, required)

**Returns**: Tuple of `RaffleInfo[]` and `RaffleConfig[]` arrays

#### `raffleCount() external view returns (uint256)`
Gets total number of raffles created.

**Returns**: Raffle count

### Winner Selection Algorithm

The contract uses a **pseudo-random number generation** approach:

1. Creates an array of indices (0 to totalParticipants - 1)
2. For each winner to select:
   - Generates random number using `keccak256(block.timestamp, block.prevrandao, block.number, raffleId, i)`
   - Takes modulo of remaining participants to get random index
   - Selects participant at that index
   - Swaps selected index with last element to avoid reselection
   - Decrements remaining participants count
3. Returns selected winners

**Note**: This is pseudo-random, not truly random, as it depends on block data that miners can influence. However, it's sufficient for raffles where participants trust the system.

### Prize Distribution Algorithm

1. Calculate creator reward: `(totalPool * creatorPct) / MAX_CREATOR_PCT`
2. Calculate finalization reward (if expired): `min(max(pool * 0.1% / 100, 0.001 ETH), 0.01 ETH)`
3. Calculate prize pool: `totalPool - creatorReward - finalizationReward`
4. Calculate prize per winner: `prizePool / numWinners`
5. Calculate remainder: `prizePool % numWinners`
6. Pay finalization reward to finalizer (if expired)
7. Pay creator reward to creator
8. Pay prize per winner to each winner
9. Pay remainder to first winner (to avoid fund loss)

### Security Features

1. **Reentrancy Protection**: Standard best practices for Ether transfers
2. **Input Validation**: All inputs are validated (title length, ticket price, end date, etc.)
3. **Ticket Limits**: Enforced limits prevent DoS attacks (1000 per transaction, 10,000 per raffle)
4. **Multiple Entries Control**: Configurable flag to allow/deny multiple tickets per user
5. **Access Control**: Only creator can finalize early (when max tickets reached)
6. **Overflow Protection**: Uses SafeMath patterns (Solidity 0.8+ has built-in overflow protection)

---
