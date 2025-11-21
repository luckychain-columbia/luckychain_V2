# LuckyChain V2

Decentralized raffle platform built on Ethereum smart contracts. Enables users to create and participate in provably fair raffles with transparent winner selection and automatic prize distribution.

> **Latest Update:** Added contract call caching system for improved performance (reduces RPC calls by ~73%). Added seed prize pool feature allowing creators to add initial ETH to prize pools.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Architecture](#project-architecture)
- [Code Structure](#code-structure)
- [How It Works](#how-it-works)
- [Performance Optimizations](#performance-optimizations)
- [Deployment](#deployment)
- [Documentation](#documentation)

---

## Features

- **Decentralized Architecture**: Built on Ethereum smart contracts with no central authority
- **Provably Fair Randomness**: On-chain randomness using block data and keccak256 hashing
- **Automatic Payouts**: Instant prize distribution via smart contract execution
- **Gas Fee Coverage**: Finalization rewards from pool cover gas costs
- **Performance Optimized**: RPC call caching reduces network requests by ~73%
- **Multi-Wallet Support**: Seamless integration with various Web3 wallets (MetaMask, Coinbase Wallet, Brave Wallet, etc.)
- **Seed Prize Pool**: Creators can add initial ETH to kickstart raffles
- **Multiple Winners**: Support for 1-100 winners per raffle
- **Configurable Creator Fees**: 0-100% creator fee (in basis points)
- **Ticket Limits**: Enforced limits to prevent DoS attacks (1000 per transaction, 10,000 per raffle)

---

## Tech Stack

### Smart Contracts
- **Solidity 0.8.19**: Smart contract programming language
- **Hardhat**: Development environment for Ethereum
- **Hardhat Ignition**: Declarative deployment system
- **Ethers.js v6**: JavaScript library for interacting with Ethereum

### Frontend
- **Next.js 15 (App Router)**: React framework with server-side rendering
- **React 18**: UI library with hooks and context API
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Accessible component library
- **Ethers.js v6**: Web3 integration

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- MetaMask or compatible Web3 wallet
- Ethereum testnet (Sepolia) or mainnet ETH (for transactions)

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd luckychain_V2/LuckyChain_V2
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env.local
# Set NEXT_PUBLIC_RAFFLE_CONTRACT_ADDRESS in .env.local
```

4. Start development server
```bash
npm run dev
```

5. Open browser
```
http://localhost:3000
```

### Smart Contract Deployment

1. Navigate to contract directory
```bash
cd contract
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env.local
# Set the following values:
# PRIVATE_KEY=your_private_key
# SEPOLIA_RPC_URL=your_sepolia_rpc_url
# ETHERSCAN_API_KEY=your_etherscan_api_key (optional)
```

4. Compile contract
```bash
npm run compile
```

5. Deploy to sepolia network
```bash
npm run deploy -- --network sepolia
```

6. Export ABI (automatically after compilation)
```bash
npm run export:abi
```

7. Update frontend `.env.local` with deployed contract address
```bash
NEXT_PUBLIC_RAFFLE_CONTRACT_ADDRESS=0x...
```

### Full Deployment Pipeline

For a complete deployment (compile, deploy, export ABI, verify):

```bash
cd contract
npm run full:deploy -- --network sepolia
```

This will:
1. Compile the contract
2. Export ABI to frontend
3. Deploy the contract
4. Sync contract address to frontend `.env.local`
5. Verify contract on Etherscan

---

## Project Architecture

### High-Level Overview

LuckyChain V2 follows a **decentralized architecture** where:

1. **Smart Contract Layer**: Ethereum smart contract (`Raffle.sol`) handles all business logic, state management, and fund transfers
2. **Frontend Layer**: Next.js application provides user interface and interacts with the smart contract via Web3
3. **Web3 Integration**: Ethers.js library connects the frontend to the Ethereum blockchain
4. **Caching Layer**: In-memory cache system reduces RPC calls and improves performance

### Data Flow

```
User Action → Frontend Component → useContract Hook → Web3 Provider → Smart Contract → Blockchain
                ↓
            Cache Layer (reads cached data when available)
                ↓
            UI Update → User Sees Result
```

### Component Hierarchy

```
app/layout.tsx (Root Layout)
├── ErrorBoundary (Error Handling)
│   └── Web3Provider (Wallet State Management)
│       ├── Toaster (Toast Notifications)
│       └── children (pages)
│           ├── app/page.tsx (Home Page)
│           │   ├── WalletConnect (Wallet Connection UI)
│           │   ├── CreateRaffleDialog (Create Raffle Form)
│           │   └── RaffleCard[] (List of Raffles)
│           ├── app/fyi/page.tsx (How It Works Page)
│           ├── app/developers/page.tsx (Developer Documentation)
│           └── app/raffle/[id]/page.tsx (Raffle Detail Page)
│               └── RaffleDetailClient (Raffle Details Component)
```

---

## Code Structure

### Directory Structure

```
LuckyChain_V2/
├── app/                          # Next.js App Router directory
│   ├── layout.tsx                # Root layout with providers
│   ├── page.tsx                  # Home page (raffle list)
│   ├── globals.css               # Global styles
│   │
│   ├── context/                  # React Context providers
│   │   └── Web3Context.tsx       # Web3 wallet state management
│   │
│   ├── types/                    # TypeScript type definitions
│   │   └── index.ts              # Type interfaces (RaffleData, Raffle, Ticket, etc.)
│   │
│   ├── fyi/                      # "How It Works" page
│   │   └── page.tsx              # FAQ and user documentation
│   │
│   ├── developers/               # Developer documentation page
│   │   └── page.tsx              # Technical documentation
│   │
│   └── raffle/                   # Raffle detail pages
│       └── [id]/                 # Dynamic route for raffle ID
│           ├── page.tsx          # Server component (generates static params)
│           └── raffle-detail-client.tsx  # Client component (raffle details)
│
├── components/                   # React components
│   ├── wallet-connect.tsx        # Wallet connection UI
│   ├── create-raffle-dialog.tsx  # Create raffle form dialog
│   ├── raffle-card.tsx           # Individual raffle card component
│   ├── raffle-card-skeleton.tsx  # Skeleton loader for raffle cards
│   ├── error-boundary.tsx        # Error boundary component
│   ├── pixelated-cash.tsx        # Animated background component
│   │
│   └── ui/                       # Reusable UI components (Radix UI)
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── input.tsx
│       ├── accordion.tsx
│       └── ... (many more)
│
├── hooks/                        # Hooks
│   └── contract.ts           # Contract interaction hook (useContract)
│
├── lib/                          # Library utilities
│   ├── web3.ts                   # Web3 utilities (contract address, availability check)
│   ├── contract-abi.ts           # Contract ABI (TypeScript)
│   ├── contract-abi.json         # Contract ABI (JSON)
│   ├── contract-cache.ts         # RPC call caching system
│   ├── contract-utils.ts     # Contract utility functions
│   ├── utils.ts                  # General utilities
│   └── mock-data.ts          # Mock data for development
│
├── contract/                     # Smart contract directory
│   ├── contracts/
│   │   └── Raffle.sol            # Main smart contract
│   ├── scripts/                  # Deployment and utility scripts
│   │   ├── deploy.js             # Basic deployment script
│   │   ├── deploy-and-sync.js    # Deploy and sync to frontend .env
│   │   ├── export-abi.js         # Export ABI to frontend
│   │   ├── verify-deployment.js  # Verify contract on Etherscan
│   │   ├── check-deployment.js   # Check deployed contract status
│   │   └── full-deploy.js        # Full deployment pipeline
│   ├── ignition/                 # Hardhat Ignition modules
│   │   └── modules/
│   │       └── RaffleModule.js   # Ignition deployment module
│   ├── hardhat.config.js         # Hardhat configuration
│   └── package.json              # Contract dependencies
│
├── public/                       # Static assets
│   ├── p_heart.webp              # Favicon
│   └── ... (other images)
│
├── next.config.mjs               # Next.js configuration
├── tsconfig.json                 # TypeScript configuration
├── package.json                  # Frontend dependencies
└── README.md                     # This file
```

---

## How It Works

### 1. User Connects Wallet

1. User clicks "Connect Wallet" button
2. `WalletConnect` component calls `useWeb3().connectWallet()`
3. `Web3Context` detects available wallets (MetaMask, Coinbase Wallet, etc.)
4. If multiple wallets are detected, a selection dialog is shown
5. User selects a wallet and approves connection
6. `Web3Context` stores the connected account and provider
7. All components using `useWeb3()` receive the updated account state

### 2. User Creates a Raffle

1. User clicks "Create Raffle" button
2. `CreateRaffleDialog` opens with a form
3. User fills in raffle details:
   - Title (required, max 50 characters)
   - Description (optional)
   - Entry Fee in ETH (required, 0.0001-1000 ETH)
   - Creator Fee % (0-50%, slider)
   - Number of Winners (1-100)
   - End Date & Time (required, must be in future)
   - Max Entrants (optional, 1-10,000)
   - Seed Prize Pool (optional, 0-1000 ETH)
   - Allow Multiple Entries (checkbox)
4. User submits form
5. `CreateRaffleDialog` calls `useContract().createRaffle()` with form data
6. `createRaffle` function:
   - Validates all inputs (client-side validation)
   - Checks user's ETH balance (if seeding prize pool)
   - Gets contract instance with signer
   - Calls `contract.createRaffle()` with parameters
   - Sends transaction with seed amount (if provided) as `value`
   - Waits for transaction confirmation
   - Extracts raffle ID from transaction receipt
   - Invalidates cache (raffles list, raffle count)
   - Returns raffle ID
7. Success toast is shown, dialog closes, raffle list refreshes

### 3. User Buys Tickets

1. User views a raffle card on the home page or detail page
2. User enters number of tickets (if multiple entries allowed)
3. User clicks "Buy Ticket" button
4. `RaffleCard` component calls `useContract().buyTicket()` with:
   - Raffle ID
   - Ticket price in ETH
   - Ticket count
5. `buyTicket` function:
   - Validates ticket count (1-1000 per transaction)
   - Checks user's ETH balance (including gas estimate)
   - Gets contract instance with signer
   - Calculates total cost (ticket price × ticket count)
   - Calls `contract.buyTickets(raffleId, ticketCount)` with ETH value
   - Waits for transaction confirmation
   - Invalidates cache (raffle info, participants, list)
   - Returns transaction receipt
6. Success toast is shown, raffle card updates (participants, progress)

### 4. Raffle Finalization

1. Raffle expires (end time reached) OR max tickets reached
2. Anyone (for expired raffles) or creator (for early finalization) can finalize
3. User clicks "Finalize Raffle & Select Winners" button
4. `RaffleCard` component calls `useContract().selectWinner()` with raffle ID
5. `selectWinner` function:
   - Gets contract instance with signer
   - Calls `contract.selectWinner(raffleId)` (which calls `finalizeRaffle` internally)
   - Waits for transaction confirmation
   - Invalidates cache (raffle info, winners, list)
   - Returns transaction receipt
6. Smart contract `_finalizeRaffle` function:
   - Validates raffle is active and not completed
   - Requires at least one participant
   - Selects winners using pseudo-random number generation
   - Calculates rewards (creator fee, finalization reward if expired)
   - Distributes prizes to winners
   - Pays creator fee
   - Pays finalization reward (if expired)
   - Marks raffle as completed
   - Emits `WinnersSelected` event
7. Success toast is shown, raffle card updates (winners displayed)

### 5. Data Loading and Caching

1. User visits home page
2. `app/page.tsx` calls `useContract().loadRaffles()`
3. `loadRaffles` function:
   - Checks cache for raffles list
   - If cached and valid, returns cached data
   - If not cached or expired:
     - Gets contract instance (read-only)
     - Gets raffle count (with caching, 30s TTL)
     - Batch fetches all raffles using `contract.getRaffles(0, count)`
     - For each raffle, fetches winners (with caching, Infinity TTL for completed)
     - Caches individual raffle info (10s TTL for active, Infinity for completed)
     - Caches raffles list (10s TTL)
     - Returns raffles array
4. Home page filters raffles by tab (active, ended, created, entered)
5. `RaffleCard` components render with raffle data
6. Periodic refresh (every 30 seconds) updates data (cache prevents unnecessary calls)

---

## Performance Optimizations

### Contract Call Caching

The platform implements intelligent caching to reduce RPC calls and improve performance.

#### Cache Strategy

- **Completed Raffles**: Cached indefinitely (never expire)
- **Active Raffles**: Cached for 10 seconds
- **Participants**: Cached for 5 seconds
- **Raffle Count**: Cached for 30 seconds
- **Raffles List**: Cached for 10 seconds

#### Cache Implementation

**Location**: `lib/contract-cache.ts`

**Key Features**:
- In-memory cache using `Map<string, CacheEntry>`
- Automatic TTL management
- Pattern-based cache invalidation
- Automatic cleanup of expired entries (every 30 seconds)

#### Cache Invalidation

Cache is automatically invalidated after:
- Creating a raffle (invalidates list and count)
- Buying tickets (invalidates raffle info, participants, list)
- Finalizing raffle (invalidates raffle info, winners, list)

#### Benefits

- **~73% reduction in RPC calls** for completed raffles
- **Faster load times** with instant data display
- **Better user experience** with smoother interactions
- **Cost savings** on paid RPC providers
- **Rate limit protection** from RPC providers

### React Optimizations

#### Memoization

- **`RaffleCard`**: Wrapped with `React.memo` to prevent unnecessary re-renders
- **Filtered raffles**: Memoized using `useMemo` to avoid recalculating on every render
- **Expensive calculations**: Memoized using `useMemo` (progress, rewards, time calculations)
- **Event handlers**: Memoized using `useCallback` to prevent function recreation

#### Batch Fetching

- **Raffles list**: Fetched in batch using `contract.getRaffles(0, count)` instead of individual calls
- **Winners**: Fetched in parallel using `Promise.all()` for multiple raffles

#### Lazy Loading

- **Raffle detail page**: Loaded only when user navigates to it
- **Participants**: Loaded only when needed (not on initial page load)

---

## Deployment

### GitHub Pages Deployment

The project is configured for static export and GitHub Pages deployment.

#### Configuration

**`next.config.mjs`**:
```javascript
const isProd = process.env.NODE_ENV === 'production'
const repo = 'luckychain_V2'

const nextConfig = {
  output: 'export', // Static export
  basePath: isProd ? `/${repo}` : undefined,
  assetPrefix: isProd ? `/${repo}/` : undefined,
  images: {
    unoptimized: true,
  },
}
```

#### GitHub Actions Workflow

**`.github/workflows/pages.yml`**:
- Builds Next.js app
- Exports static files
- Deploys to GitHub Pages

#### Build Process

1. Install dependencies
2. Build Next.js app (`npm run build`)
3. Export static files to `out/` directory
4. Deploy `out/` directory to GitHub Pages

#### Base Path Handling

The application dynamically detects the base path for GitHub Pages:
- Development: No base path (empty string)
- Production: `/luckychain_V2` base path

This is handled by `getBasePath()` and `getRaffleUrl()` utility functions.

---

## Documentation

### User Documentation

- **How It Works**: `/fyi` - FAQ and user documentation
- **Developer Documentation**: `/developers` - Technical documentation for developers

### Additional Documentation

- **Caching Explanation**: `docs/CACHING_EXPLANATION.md` - Detailed explanation of caching system
- **Caching Implementation**: `docs/CACHING_IMPLEMENTATION.md` - Implementation details
- **Edge Cases Analysis**: `docs/EDGE_CASES_ANALYSIS.md` - Edge cases and handling
- **Testing Report**: `docs/TESTING_REPORT.md` - Testing plan and report
- **Detailed component and Smart contract**: `docs/DETAILS.md` - Quick reference guide
- **Contract Automation**: `contract/AUTOMATION.md` - Contract deployment automation
- **Contract Quick Reference**: `contract/AUTOMATION_QUICK_REF.md` - Quick reference guide

---

## License

MIT

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## Support

For questions or issues, please open an issue on GitHub.

---

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- UI components from [Radix UI](https://www.radix-ui.com/)
- Web3 integration with [Ethers.js](https://ethers.org/)
- Smart contract development with [Hardhat](https://hardhat.org/)
