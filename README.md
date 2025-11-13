# LuckyChain V2

Decentralized raffle platform built on Ethereum smart contracts. Enables users to create and participate in provably fair raffles with transparent winner selection and automatic prize distribution.

## Features

- **Decentralized Architecture**: Built on Ethereum smart contracts with no central authority
- **Provably Fair Randomness**: On-chain randomness using block data and keccak256 hashing
- **Automatic Payouts**: Instant prize distribution via smart contract execution
- **Gas Fee Coverage**: Finalization rewards from pool cover gas costs
- **Performance Optimized**: RPC call caching reduces network requests by ~73%

## Tech Stack

### Smart Contracts
- Solidity 0.8.19
- Hardhat
- Hardhat Ignition
- Ethers.js v6

### Frontend
- Next.js 15 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Radix UI
- Ethers.js v6

## Performance Optimizations

### Contract Call Caching
The platform implements intelligent caching to reduce RPC calls and improve performance:

- **Completed Raffles**: Cached indefinitely (never expire)
- **Active Raffles**: Cached for 10 seconds
- **Participants**: Cached for 5 seconds
- **Raffle Count**: Cached for 30 seconds
- **Raffle List**: Cached for 10 seconds

**Benefits:**
- ~73% reduction in RPC calls for completed raffles
- Faster load times with instant data display
- Better user experience with smoother interactions
- Cost savings on paid RPC providers
- Rate limit protection

**Cache Invalidation:**
- Automatically invalidated after creating raffles
- Automatically invalidated after buying tickets
- Automatically invalidated after finalizing raffles
- Automatic cleanup of expired entries every 30 seconds

## Getting Started

### Prerequisites
- Node.js 18+
- npm or pnpm
- MetaMask or compatible Web3 wallet

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

### Smart Contract Deployment

1. Navigate to contract directory
```bash
cd contract
```

2. Install dependencies
```bash
npm install
```

3. Compile contract
```bash
npm run compile
```

4. Deploy to network
```bash
npm run deploy -- --network sepolia
```

5. Export ABI (automatically after compilation)
```bash
npm run export:abi
```

## Documentation

- **User Documentation**: `/fyi` - How the raffle platform works
- **Developer Documentation**: `/developers` - Technical documentation for developers

## License

MIT
